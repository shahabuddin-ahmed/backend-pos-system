import { fn, col, Transaction } from "sequelize";
import { Sale, SaleItem, Outlet, MasterMenuItem } from "../model";
import { SaleInterface } from "../model/sale";
import { SaleItemInterface } from "../model/saleItem";

export interface SaleRepoInterface {
    createSale(sale: SaleInterface, items: SaleItemInterface[], transaction: Transaction): Promise<SaleInterface | null>;
    revenueByOutlet(): Promise<SaleInterface[]>;
    topItemsByOutlet(outletId: number): Promise<any[]>;
}

export class SaleRepo implements SaleRepoInterface {
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

    public async revenueByOutlet(): Promise<SaleInterface[]> {
        return Sale.findAll({
            attributes: [[fn("SUM", col("totalAmount")), "totalRevenue"]],
            include: [{ model: Outlet, as: "outlet", attributes: ["name", "code"] }],
            group: ["Sale.outletId", "outlet.id"],
        });
    }

    public async topItemsByOutlet(outletId: number): Promise<any[]> {
        return SaleItem.findAll({
            attributes: [
                [fn("SUM", col("quantity")), "totalQuantity"]
            ],
            include: [
                { model: Sale, as: "sale", attributes: [], where: { outletId } },
                { model: MasterMenuItem, as: "masterMenuItem", attributes: ["name", "sku"] }
            ],
            group: ["SaleItem.masterMenuItemId", "masterMenuItem.id"],
            order: [[fn("SUM", col("quantity")), "DESC"]],
            limit: 5,
            subQuery: false
        });
    }
}

export const newSaleRepo = async (): Promise<SaleRepoInterface> => {
    return new SaleRepo();
};
