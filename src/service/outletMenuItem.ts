import { OutletMenuItemInterface } from "../model/outletMenuItem";
import { MasterMenuItemRepoInterface } from "../repo/masterMenuItem";
import { OutletMenuItemRepoInterface } from "../repo/outletMenuItem";
import { OutletRepoInterface } from "../repo/outlet";
import { NotFoundException } from "../web/exception/not-found-exception";
import { ERROR_CODES } from "../constant/error";

export interface OutletMenuItemServiceInterface {
    assign(item: OutletMenuItemInterface): Promise<OutletMenuItemInterface>;
    listByOutlet(outletId: number): Promise<any[]>;
}

export class OutletMenuItemService implements OutletMenuItemServiceInterface {
    constructor(
        private repo: OutletMenuItemRepoInterface,
        private outletRepo: OutletRepoInterface,
        private menuRepo: MasterMenuItemRepoInterface
    ) {
        this.repo = repo;
        this.outletRepo = outletRepo;
        this.menuRepo = menuRepo;
    }

    async assign(item: OutletMenuItemInterface): Promise<OutletMenuItemInterface> {
        const outlet = await this.outletRepo.findById(item.outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_OUTLET_NOT_FOUND);
        }
        
        const menuItem = await this.menuRepo.findById(item.masterMenuItemId);
        if (!menuItem) {
            throw new NotFoundException(ERROR_CODES.E_MENU_ITEM_NOT_FOUND);
        }

        return this.repo.upsert({ ...item, overridePrice: item.overridePrice ?? menuItem.basePrice, isAvailable: item.isAvailable ?? true });
    }

    async listByOutlet(outletId: number): Promise<any[]> {
        const outlet = await this.outletRepo.findById(outletId);
        if (!outlet) {
            throw new NotFoundException(ERROR_CODES.E_OUTLET_NOT_FOUND);
        }

        const outletMenuItems = await this.repo.listByOutlet(outletId);

        return outletMenuItems.map((outletMenuItem) => ({
            id: outletMenuItem.id,
            outletId: outletMenuItem.outletId,
            masterMenuItemId: outletMenuItem.masterMenuItemId,
            overridePrice: outletMenuItem.overridePrice,
            isAvailable: outletMenuItem.isAvailable,
            masterMenuItem: outletMenuItem.masterMenuItem,
            effectivePrice: outletMenuItem.overridePrice ?? outletMenuItem.masterMenuItem?.basePrice
        }));
    }
}

export const newOutletMenuItemService = async (
    repo: OutletMenuItemRepoInterface,
    outletRepo: OutletRepoInterface,
    menuRepo: MasterMenuItemRepoInterface
): Promise<OutletMenuItemService> => {
    return new OutletMenuItemService(repo, outletRepo, menuRepo);
};
