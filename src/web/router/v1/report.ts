import { Router } from "express";
import { asyncHandler } from "../../middleware/async-hander";
import { ReportControllerInterface } from "../../controller/v1/report";

export const newReportRouter = async (controller: ReportControllerInterface): Promise<Router> => {
    const router = Router();
    router.get("/summary", asyncHandler(controller.summary));
    router.get("/revenue-by-outlet", asyncHandler(controller.revenueByOutlet));
    router.get("/top-items/:outletId", asyncHandler(controller.topItemsByOutlet));
    return router;
};
