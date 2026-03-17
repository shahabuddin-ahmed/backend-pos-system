import { ERROR_CODES } from "../constant/error";
import { MasterMenuItemInterface } from "../model/masterMenuItem";
import { MasterMenuItemRepoInterface } from "../repo/masterMenuItem";
import { BadRequestException } from "../web/exception/bad-request-exception";
import { NotFoundException } from "../web/exception/not-found-exception";

export interface MasterMenuItemServiceInterface {
    create(item: MasterMenuItemInterface): Promise<MasterMenuItemInterface>;
    list(): Promise<MasterMenuItemInterface[]>;
    getById(id: number): Promise<MasterMenuItemInterface | null>;
    update(id: number, payload: Partial<Pick<MasterMenuItemInterface, "name" | "basePrice" | "isActive">>): Promise<MasterMenuItemInterface>;
}

export class MasterMenuItemService implements MasterMenuItemServiceInterface {
    constructor(private repo: MasterMenuItemRepoInterface) {
        this.repo = repo;
    }

    async create(item: MasterMenuItemInterface): Promise<MasterMenuItemInterface> {
        const existingItem = await this.repo.findByNameOrSku(item.name, item.sku);
        if (existingItem) {
            throw new BadRequestException(ERROR_CODES.E_DUPLICATE_ENTRY, "Menu item with the same name or SKU already exists");
        }

        return this.repo.create({ ...item, isActive: item.isActive ?? true });
    }

    async list(): Promise<MasterMenuItemInterface[]> {
        return this.repo.list();
    }

    async getById(id: number): Promise<MasterMenuItemInterface> {
        const item = await this.repo.findById(id);
        if (!item) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Menu item not found");
        }
        return item;
    }

    async update(id: number, payload: Partial<Pick<MasterMenuItemInterface, "name" | "basePrice" | "isActive">>): Promise<MasterMenuItemInterface> {
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

        return this.repo.update(id, payload);
    }
}

export const newMasterMenuItemService = async (repo: MasterMenuItemRepoInterface): Promise<MasterMenuItemService> => {
    return new MasterMenuItemService(repo);
};
