import { Router } from "express";
import { asyncHandler } from "../../middleware/async-hander";
import { OutletControllerInterface } from "../../controller/v1/outlet";

export const newOutletRouter = async (controller: OutletControllerInterface): Promise<Router> => {
    const router = Router();
    router.post("/", asyncHandler(controller.create));
    router.get("/", asyncHandler(controller.list));
    router.get("/:id", asyncHandler(controller.getById));
    router.patch("/:id", asyncHandler(controller.updateById));
    return router;
};
