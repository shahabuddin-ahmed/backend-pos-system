import { OutletMenuItem, MasterMenuItem } from "../model";
import { OutletMenuItemInterface } from "../model/outletMenuItem";

export interface OutletMenuItemRepoInterface {
    upsert(item: OutletMenuItemInterface): Promise<OutletMenuItemInterface>;
    listByOutlet(outletId: number): Promise<OutletMenuItemInterface[]>;
    findAssignment(outletId: number, masterMenuItemId: number): Promise<OutletMenuItemInterface | null>;
}

export class OutletMenuItemRepo implements OutletMenuItemRepoInterface {
    public async upsert(item: OutletMenuItemInterface): Promise<OutletMenuItemInterface> {
        const existing = await OutletMenuItem.findOne({ where: { outletId: item.outletId, masterMenuItemId: item.masterMenuItemId } });
        if (existing) {
            return existing.update(item);
        }

        return OutletMenuItem.create(item);
    }

    public async listByOutlet(outletId: number): Promise<OutletMenuItemInterface[]> {
        return OutletMenuItem.findAll({
            where: { outletId, isAvailable: true },
            include: [{ model: MasterMenuItem, as: "masterMenuItem" }],
            order: [["id", "ASC"]]
        });
    }

    public async findAssignment(outletId: number, masterMenuItemId: number): Promise<OutletMenuItemInterface | null> {
        return OutletMenuItem.findOne({ where: { outletId, masterMenuItemId, isAvailable: true } });
    }
}

export const newOutletMenuItemRepo = async (): Promise<OutletMenuItemRepoInterface> => {
    return new OutletMenuItemRepo();
};
