import { InventoryRepoInterface } from "../repo/inventory";
import { MasterMenuItemRepo } from "../repo/masterMenuItem";
import { OutletMenuItemRepoInterface } from "../repo/outletMenuItem";
import { OutletReceiptSequenceRepoInterface } from "../repo/outletReceiptSequence";
import { OutletRepoInterface } from "../repo/outlet";
import { SaleRepoInterface } from "../repo/sale";
import { ERROR_CODES } from "../constant/error";
import { NotFoundException } from "../web/exception/not-found-exception";
import { BadRequestException } from "../web/exception/bad-request-exception";

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
    revenueByOutlet(): Promise<any[]>;
    topItemsByOutlet(outletId: number): Promise<any[]>;
}

export class SaleService implements SaleServiceInterface {
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

    async revenueByOutlet(): Promise<any[]> {
        return this.saleRepo.revenueByOutlet();
    }

    async topItemsByOutlet(outletId: number): Promise<any[]> {
        const outlet = await this.outletRepo.findById(outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
        }
        return this.saleRepo.topItemsByOutlet(outletId);
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
