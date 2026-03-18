import { ERROR_CODES } from "../constant/error";
import { OutletInterface } from "../model/outlet";
import { OutletRepoInterface } from "../repo/outlet";
import { BadRequestException } from "../web/exception/bad-request-exception";
import { NotFoundException } from "../web/exception/not-found-exception";

export interface OutletServiceInterface {
    create(outlet: OutletInterface): Promise<OutletInterface>;
    list(): Promise<OutletInterface[]>;
    getById(id: number): Promise<OutletInterface>;
    updateById(id: number, payload: Partial<Pick<OutletInterface, "name" | "location" | "isActive">>): Promise<OutletInterface | null>;
}

export class OutletService implements OutletServiceInterface {
    constructor(private repo: OutletRepoInterface) {
        this.repo = repo;
    }

    async create(outlet: OutletInterface): Promise<OutletInterface> {
        const existingOutlet = await this.repo.findByNameOrCode(outlet.name, outlet.code);
        if (existingOutlet) {
            throw new BadRequestException(ERROR_CODES.E_DUPLICATE_ENTRY, "Outlet name or code already exists");
        }

        return this.repo.create({ ...outlet, isActive: outlet.isActive ?? true });
    }

    async list(): Promise<OutletInterface[]> {
        return this.repo.list();
    }

    async getById(id: number): Promise<OutletInterface> {
        const outlet = await this.repo.findById(id);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
        }
        return outlet;
    }

    async updateById(id: number, payload: Partial<Pick<OutletInterface, "name" | "location" | "isActive">>): Promise<OutletInterface | null> {
        const item = await this.repo.findById(id);
        if (!item) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Menu item not found");
        }

        if (payload.name && payload.name !== item.name) {
            const existingItem = await this.repo.findByName(payload.name);
            if (existingItem && existingItem.id !== id) {
                throw new BadRequestException(ERROR_CODES.E_DUPLICATE_ENTRY, "Menu item with the same name already exists");
            }
        }

        return this.repo.updateById(id, payload);
    }
}

export const newOutletService = async (repo: OutletRepoInterface): Promise<OutletService> => {
    return new OutletService(repo);
};
