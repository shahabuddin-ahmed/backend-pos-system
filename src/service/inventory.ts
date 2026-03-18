import { InventoryInterface } from "../model/inventory";
import { InventoryRepoInterface } from "../repo/inventory";
import { MasterMenuItemRepoInterface } from "../repo/masterMenuItem";
import { OutletRepoInterface } from "../repo/outlet";
import { ERROR_CODES } from "../constant/error";
import { NotFoundException } from "../web/exception/not-found-exception";

export interface InventoryServiceInterface {
    setStock(inventory: InventoryInterface): Promise<InventoryInterface>;
    listByOutlet(outletId: number): Promise<any[]>;
}

export class InventoryService implements InventoryServiceInterface {
    constructor(
        private repo: InventoryRepoInterface,
        private outletRepo: OutletRepoInterface,
        private menuRepo: MasterMenuItemRepoInterface
    ) {
        this.repo = repo;
        this.outletRepo = outletRepo;
        this.menuRepo = menuRepo;
    }

    async setStock(inventory: InventoryInterface): Promise<InventoryInterface> {
        const outlet = await this.outletRepo.findById(inventory.outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_OUTLET_NOT_FOUND);
        }

        const menuItem = await this.menuRepo.findById(inventory.masterMenuItemId);
        if (!menuItem) {
            throw new NotFoundException(ERROR_CODES.E_MENU_ITEM_NOT_FOUND);
        }
        
        return this.repo.upsert(inventory);
    }

    async listByOutlet(outletId: number): Promise<any[]> {
        const outlet = await this.outletRepo.findById(outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "Outlet not found");
        }
        return this.repo.listByOutlet(outletId);
    }
}

export const newInventoryService = async (
    repo: InventoryRepoInterface,
    outletRepo: OutletRepoInterface,
    menuRepo: MasterMenuItemRepoInterface
): Promise<InventoryService> => {
    return new InventoryService(repo, outletRepo, menuRepo);
};
