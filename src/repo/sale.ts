import { fn, col, Op, Transaction, WhereOptions } from "sequelize";
import { Sale, SaleItem, Outlet, MasterMenuItem } from "../model";
import { SaleInterface } from "../model/sale";
import { SaleItemInterface } from "../model/saleItem";
import { ReportRange } from "../service/reportPeriod";
import { RevenueByOutletRecord, TopItemByOutletRecord } from "../service/reportType";

export interface SaleRepoInterface {
    createSale(sale: SaleInterface, items: SaleItemInterface[], transaction: Transaction): Promise<SaleInterface | null>;
    revenueByOutlet(range?: ReportRange): Promise<RevenueByOutletRecord[]>;
    topItemsByOutlet(outletId: number, range?: ReportRange): Promise<TopItemByOutletRecord[]>;
}

export class SaleRepo implements SaleRepoInterface {
    private buildSaleDateWhere(range?: ReportRange): WhereOptions<SaleInterface> | undefined {
        if (!range?.start || !range?.end) {
            return undefined;
        }

        return {
            createdAt: {
                [Op.gte]: range.start,
                [Op.lt]: range.end,
            }
        };
    }

    public async createSale(sale: SaleInterface, items: SaleItemInterface[], transaction: Transaction): Promise<SaleInterface | null> {
        const createdSale = await Sale.create(sale, { transaction });
        const mappedItems = items.map((item) => ({ ...item, saleId: createdSale.getDataValue("id") as number }));
        await SaleItem.bulkCreate(mappedItems, { transaction });

        return Sale.findByPk(createdSale.getDataValue("id") as number, {
            include: [
                {   model: SaleItem, as: "items",
                    attributes: { exclude: ["saleId", "masterMenuItemId"] },
                    include: [{ model: MasterMenuItem, as: "masterMenuItem" }] 
                }
            ],
            attributes: { exclude: ["outletId"] },
            transaction
        });
    }

    public async revenueByOutlet(range?: ReportRange): Promise<RevenueByOutletRecord[]> {
        return Sale.findAll({
            attributes: [[fn("SUM", col("totalAmount")), "totalRevenue"]],
            include: [{ model: Outlet, as: "outlet", attributes: ["id", "name", "code"] }],
            where: this.buildSaleDateWhere(range),
            group: ["Sale.outletId", "outlet.id"],
            order: [[fn("SUM", col("totalAmount")), "DESC"]],
        }) as unknown as RevenueByOutletRecord[];
    }

    public async topItemsByOutlet(outletId: number, range?: ReportRange): Promise<TopItemByOutletRecord[]> {
        return SaleItem.findAll({
            attributes: [
                [fn("SUM", col("quantity")), "totalQuantity"]
            ],
            include: [
                {
                    model: Sale,
                    as: "sale",
                    attributes: [],
                    where: {
                        outletId,
                        ...this.buildSaleDateWhere(range),
                    }
                },
                { model: MasterMenuItem, as: "masterMenuItem", attributes: ["name", "sku"] }
            ],
            group: ["SaleItem.masterMenuItemId", "masterMenuItem.id"],
            order: [[fn("SUM", col("quantity")), "DESC"]],
            limit: 5,
            subQuery: false
        }) as unknown as TopItemByOutletRecord[];
    }
}

export const newSaleRepo = async (): Promise<SaleRepoInterface> => {
    return new SaleRepo();
};
