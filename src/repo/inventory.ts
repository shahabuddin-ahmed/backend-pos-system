import { Transaction } from "sequelize";
import { Inventory, Outlet, MasterMenuItem, OutletMenuItem } from "../model";
import { InventoryInterface } from "../model/inventory";

export interface InventoryRepoInterface {
    upsert(inventory: InventoryInterface): Promise<InventoryInterface>;
    listByOutlet(outletId: number): Promise<any[]>;
    findOneForUpdate(outletId: number, masterMenuItemId: number, transaction: Transaction): Promise<Inventory | null>;
}

export class InventoryRepo implements InventoryRepoInterface {
    public async upsert(inventory: InventoryInterface): Promise<InventoryInterface> {
        const existing = await Inventory.findOne({ where: { outletId: inventory.outletId, masterMenuItemId: inventory.masterMenuItemId } });
        if (existing) {
            return await existing.update({ currentStock: inventory.currentStock, updatedAt: new Date() });
        }
        return await Inventory.create(inventory);
    }

    public async listByOutlet(outletId: number): Promise<any[]> {
        return await Inventory.findAll({
            where: { outletId },
            include: [
                {
                    model: MasterMenuItem,
                    as: "masterMenuItem",
                },
                { model: Outlet, as: "outlet" }
            ],
            order: [["id", "ASC"]]
        });
    }

    public async findOneForUpdate(outletId: number, masterMenuItemId: number, transaction: Transaction): Promise<Inventory | null> {
        return Inventory.findOne({ where: { outletId, masterMenuItemId }, transaction, lock: transaction.LOCK.UPDATE });
    }
}

export const newInventoryRepo = async (): Promise<InventoryRepoInterface> => {
    return new InventoryRepo();
};
