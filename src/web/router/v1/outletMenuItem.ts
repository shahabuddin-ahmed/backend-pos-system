import { Router } from "express";
import { asyncHandler } from "../../middleware/async-hander";
import { OutletMenuItemControllerInterface } from "../../controller/v1/outletMenuItem";

export const newOutletMenuItemRouter = async (controller: OutletMenuItemControllerInterface): Promise<Router> => {
    const router = Router();
    router.post("/", asyncHandler(controller.assign));
    router.get("/:outletId", asyncHandler(controller.listByOutlet));
    return router;
};
