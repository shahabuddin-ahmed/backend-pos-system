import { Router } from "express";
import { asyncHandler } from "../../middleware/async-hander";
import { InventoryControllerInterface } from "../../controller/v1/inventory";

export const newInventoryRouter = async (controller: InventoryControllerInterface): Promise<Router> => {
    const router = Router();
    router.post("/", asyncHandler(controller.setStock));
    router.get("/:outletId", asyncHandler(controller.listByOutlet));
    return router;
};
