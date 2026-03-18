import { Router } from "express";
import { NotFoundException } from "../../exception/not-found-exception";
import { ERROR_CODES } from "../../../constant/error";
import { newHealthRouter } from "./health";
import { newMasterMenuItemRouter } from "./masterMenuItem";
import { MasterMenuItemControllerInterface } from "../../controller/v1/masterMenuItem";
import { OutletControllerInterface } from "../../controller/v1/outlet";
import { newOutletRouter } from "./outlet";

export const newV1Router = async ({
    outletMenuItemController,
    outletController
}: {
    outletMenuItemController: MasterMenuItemControllerInterface;
    outletController: OutletControllerInterface;
}): Promise<Router> => {
    const v1 = Router();
    v1.use("/health", await newHealthRouter());
    v1.use("/master-menu-item", await newMasterMenuItemRouter(outletMenuItemController));
    v1.use("/outlets", await newOutletRouter(outletController));

    v1.use("*", (_req, res) => {
        console.log(`not_found_for_v1`, _req.method, _req.baseUrl);
        throw new NotFoundException(ERROR_CODES.E_PAGE_NOT_FOUND, "", [
            `Cannot ${_req.method} ${_req.baseUrl}`,
        ]);
    });

    return v1;
};
