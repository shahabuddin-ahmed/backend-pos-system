import { InventoryRepoInterface } from "../repo/inventory";
import { MasterMenuItemRepo } from "../repo/masterMenuItem";
import { OutletMenuItemRepoInterface } from "../repo/outletMenuItem";
import { OutletReceiptSequenceRepoInterface } from "../repo/outletReceiptSequence";
import { OutletRepoInterface } from "../repo/outlet";
import { SaleRepoInterface } from "../repo/sale";
import { ERROR_CODES } from "../constant/error";
import { NotFoundException } from "../web/exception/not-found-exception";
import { BadRequestException } from "../web/exception/bad-request-exception";
import { ReportPeriod, resolveReportRange } from "./reportPeriod";
import { ReportSummary, RevenueByOutletRecord, RevenueByOutletRow, TopItemByOutletRecord, TopItemByOutletRow } from "./reportType";

export interface SaleItemPayload {
    masterMenuItemId: number;
    quantity: number;
}

export interface CreateSalePayload {
    outletId: number;
    items: SaleItemPayload[];
}

export interface SaleServiceInterface {
    createSale(payload: CreateSalePayload): Promise<any>;
    revenueByOutlet(period: ReportPeriod): Promise<RevenueByOutletRow[]>;
    topItemsByOutlet(outletId: number, period: ReportPeriod): Promise<TopItemByOutletRow[]>;
    reportSummary(period: ReportPeriod, outletId?: number): Promise<ReportSummary>;
}

export class SaleService implements SaleServiceInterface {
    private toPlainReportRow(entry: RevenueByOutletRecord): RevenueByOutletRow {
        const rawEntry = entry.get({ plain: true });

        return {
            totalRevenue: Number(rawEntry?.totalRevenue ?? 0),
            outlet: rawEntry?.outlet
                ? {
                    id: Number(rawEntry.outlet.id),
                    name: rawEntry.outlet.name,
                    code: rawEntry.outlet.code,
                }
                : null,
        };
    }

    private toPlainTopItem(entry: TopItemByOutletRecord): TopItemByOutletRow {
        const rawEntry = entry.get({ plain: true });

        return {
            totalQuantity: Number(rawEntry?.totalQuantity ?? 0),
            masterMenuItem: rawEntry?.masterMenuItem
                ? {
                    name: rawEntry.masterMenuItem.name,
                    sku: rawEntry.masterMenuItem.sku,
                }
                : null,
        };
    }

    constructor(
        private saleRepo: SaleRepoInterface,
        private outletRepo: OutletRepoInterface,
        private outletMenuItemRepo: OutletMenuItemRepoInterface,
        private inventoryRepo: InventoryRepoInterface,
        private sequenceRepo: OutletReceiptSequenceRepoInterface
    ) {
        this.saleRepo = saleRepo;
        this.outletRepo = outletRepo;
        this.outletMenuItemRepo = outletMenuItemRepo;
        this.inventoryRepo = inventoryRepo;
        this.sequenceRepo = sequenceRepo;
    }

    async createSale(payload: CreateSalePayload): Promise<any> {
        const outlet = await this.outletRepo.findById(payload.outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
        }
        if (!payload.items?.length) {
            throw new BadRequestException(ERROR_CODES.E_INVALID_DATA, "Sale must include at least one item");
        }

        return MasterMenuItemRepo.withTransaction(async (transaction) => {
            let totalAmount = 0;
            const saleItemsToCreate: any[] = [];

            for (const requestedItem of payload.items) {
                if (requestedItem.quantity <= 0) {
                    throw new BadRequestException(ERROR_CODES.E_INVALID_DATA, "Item quantity must be greater than zero");
                }

                const assignment = await this.outletMenuItemRepo.findAssignment(payload.outletId, requestedItem.masterMenuItemId);
                if (!assignment) {
                    throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, `Menu item ${requestedItem.masterMenuItemId} is not assigned to the outlet`);
                }

                const inventory = await this.inventoryRepo.findOneForUpdate(payload.outletId, requestedItem.masterMenuItemId, transaction);
                if (!inventory || inventory.getDataValue("currentStock") < requestedItem.quantity) {
                    throw new BadRequestException(ERROR_CODES.E_INSUFFICIENT_STOCK, `Insufficient stock for menu item ${requestedItem.masterMenuItemId}`);
                }

                const unitPrice = Number(assignment.overridePrice ?? 0) > 0
                    ? Number(assignment.overridePrice)
                    : Number((await this.outletMenuItemRepo.listByOutlet(payload.outletId)).find((row) => row.masterMenuItemId === requestedItem.masterMenuItemId)?.masterMenuItem?.basePrice ?? 0);

                const lineTotal = unitPrice * requestedItem.quantity;
                totalAmount += lineTotal;

                saleItemsToCreate.push({
                    masterMenuItemId: requestedItem.masterMenuItemId,
                    quantity: requestedItem.quantity,
                    unitPrice,
                    lineTotal
                });

                await inventory.update({ currentStock: inventory.getDataValue("currentStock") - requestedItem.quantity, updatedAt: new Date() }, { transaction });
            }

            const receiptNumber = await this.sequenceRepo.nextReceiptNumber(payload.outletId, outlet.code, transaction);
            const sale = await this.saleRepo.createSale(
                {
                    outletId: payload.outletId,
                    receiptNumber,
                    totalAmount
                },
                saleItemsToCreate,
                transaction
            );

            return sale;
        });
    }

    async revenueByOutlet(period: ReportPeriod): Promise<RevenueByOutletRow[]> {
        return (await this.saleRepo.revenueByOutlet(resolveReportRange(period))).map((entry) => this.toPlainReportRow(entry));
    }

    async topItemsByOutlet(outletId: number, period: ReportPeriod): Promise<TopItemByOutletRow[]> {
        const outlet = await this.outletRepo.findById(outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
        }
        return (await this.saleRepo.topItemsByOutlet(outletId, resolveReportRange(period))).map((entry) => this.toPlainTopItem(entry));
    }

    async reportSummary(period: ReportPeriod, outletId?: number): Promise<ReportSummary> {
        const revenueByOutlet = await this.revenueByOutlet(period);
        const totalRevenue = revenueByOutlet.reduce((sum, entry) => sum + entry.totalRevenue, 0);
        const topOutlet = revenueByOutlet[0] ?? null;

        let selectedOutletId: number | null = null;
        if (typeof outletId === "number") {
            const outlet = await this.outletRepo.findById(outletId);
            if (!outlet) {
                throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
            }
            selectedOutletId = outletId;
        } else if (topOutlet?.outlet?.id) {
            selectedOutletId = Number(topOutlet.outlet.id);
        }

        const topItems = selectedOutletId
            ? await this.topItemsByOutlet(selectedOutletId, period)
            : [];

        return {
            period,
            totalRevenue,
            topOutlet,
            selectedOutletId,
            revenueByOutlet,
            topItems,
        };
    }
}

export const newSaleService = async (
    saleRepo: SaleRepoInterface,
    outletRepo: OutletRepoInterface,
    outletMenuItemRepo: OutletMenuItemRepoInterface,
    inventoryRepo: InventoryRepoInterface,
    sequenceRepo: OutletReceiptSequenceRepoInterface
): Promise<SaleService> => {
    return new SaleService(saleRepo, outletRepo, outletMenuItemRepo, inventoryRepo, sequenceRepo);
};
