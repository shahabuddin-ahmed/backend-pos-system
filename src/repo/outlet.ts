import { Op } from "sequelize";
import { Outlet } from "../model";
import { OutletInterface } from "../model/outlet";

export interface OutletRepoInterface {
    create(outlet: OutletInterface): Promise<OutletInterface>;
    list(): Promise<OutletInterface[]>;
    findById(id: number): Promise<OutletInterface | null>;
    findByNameOrCode(name: string, code: string): Promise<OutletInterface | null>;
    findByName(name: string): Promise<OutletInterface | null>;
    updateById(id: number, payload: Partial<Pick<OutletInterface, "name" | "location" | "isActive">>): Promise<OutletInterface | null>;
}

export class OutletRepo implements OutletRepoInterface {
    public async create(outlet: OutletInterface): Promise<OutletInterface> {
        return Outlet.create(outlet);
    }

    public async list(): Promise<OutletInterface[]> {
        return Outlet.findAll();
    }

    public async findById(id: number): Promise<OutletInterface | null> {
        return Outlet.findByPk(id);
    }

    public async findByNameOrCode(name: string, code: string): Promise<OutletInterface | null> {
        return Outlet.findOne({
            where: {
                [Op.or]: [
                    { name },
                    { code }
                ]
            }
        });
    }

    public async updateById(id: number, payload: Partial<Pick<OutletInterface, "name" | "location" | "isActive">>): Promise<OutletInterface | null> {
        const outlet = await Outlet.findByPk(id);
        if (!outlet) {
            return null;
        }
        await outlet.update(payload);
        return outlet;
    }

    public async findByName(name: string): Promise<OutletInterface | null> {
        return Outlet.findOne({ where: { name } });
    }
}

export const newOutletRepo = async (): Promise<OutletRepoInterface> => {
    return new OutletRepo();
};
