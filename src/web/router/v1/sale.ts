import { Router } from "express";
import { asyncHandler } from "../../middleware/async-hander";
import { SaleControllerInterface } from "../../controller/v1/sale";

export const newSaleRouter = async (controller: SaleControllerInterface): Promise<Router> => {
    const router = Router();
    router.post("/", asyncHandler(controller.create));
    return router;
};
