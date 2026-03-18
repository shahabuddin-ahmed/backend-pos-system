import { Op, Transaction } from "sequelize";
import { MasterMenuItem } from "../model";
import { MasterMenuItemInterface } from "../model/masterMenuItem";
import newSequelize from "../infra/sequelize";

export interface MasterMenuItemRepoInterface {
    create(item: MasterMenuItemInterface): Promise<MasterMenuItemInterface>;
    list(): Promise<MasterMenuItemInterface[]>;
    findById(id: number): Promise<MasterMenuItemInterface | null>;
    findByName(name: string): Promise<MasterMenuItemInterface | null>;
    findByNameOrSku(name: string, sku: string): Promise<MasterMenuItemInterface | null>;
    updateById(id: number, payload: Partial<Pick<MasterMenuItemInterface, "name" | "basePrice" | "isActive">>): Promise<MasterMenuItemInterface>;
}

export class MasterMenuItemRepo implements MasterMenuItemRepoInterface {
    public async create(item: MasterMenuItemInterface): Promise<MasterMenuItemInterface> {
        const created = await MasterMenuItem.create(item);
        return created.get({ plain: true }) as MasterMenuItemInterface;
    }

    public async findByNameOrSku(name: string, sku: string): Promise<MasterMenuItemInterface | null> {
        return MasterMenuItem.findOne({
            where: {
                [Op.or]: [
                    { name: name },
                    { sku: sku }
                ]
            }
        });
    }

    public async findByName(name: string): Promise<MasterMenuItemInterface | null> {
        return MasterMenuItem.findOne({ where: { name }});
    }

    public async list(): Promise<MasterMenuItemInterface[]> {
        const items = await MasterMenuItem.findAll({
            order: [["id", "ASC"]]
        });
        return items.map((item) => item.get({ plain: true }) as MasterMenuItemInterface);
    }

    public async findById(id: number): Promise<MasterMenuItemInterface | null> {
        return MasterMenuItem.findByPk(id);
    }

    public async updateById(id: number, payload: Partial<Pick<MasterMenuItemInterface, "name" | "basePrice" | "isActive">>): Promise<MasterMenuItemInterface> {
        const item = await MasterMenuItem.findByPk(id);
        await item!.update(payload);
        return item!.get({ plain: true }) as MasterMenuItemInterface;
    }

    public static async withTransaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
        const transaction = await newSequelize().transaction();
        try {
            const response = await fn(transaction);
            await transaction.commit();
            return response;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export const newMasterMenuItemRepo = async (): Promise<MasterMenuItemRepoInterface> => {
    return new MasterMenuItemRepo();
};
