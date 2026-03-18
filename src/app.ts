import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { newV1Router } from "./web/router/v1/index";
import { newMasterMenuItemV1Controller } from "./web/controller/v1/masterMenuItem";
import { globalErrorHandler } from "./web/middleware/global-error-handler";
import { initializeDBConnection } from "./infra/db";
import { newMasterMenuItemRepo } from "./repo/masterMenuItem";
import { newMasterMenuItemService } from "./service/masterMenuItem";
import { newOutletService } from "./service/outlet";
import { newOutletRepo } from "./repo/outlet";
import { newOutletV1Controller } from "./web/controller/v1/outlet";
import { newOutletMenuItemRepo } from "./repo/outletMenuItem";
import { newOutletMenuItemService } from "./service/outletMenuItem";
import { newOutletMenuItemV1Controller } from "./web/controller/v1/outletMenuItem";
import { newInventoryV1Controller } from "./web/controller/v1/inventory";
import { newInventoryService } from "./service/inventory";
import { newInventoryRepo } from "./repo/inventory";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    await initializeDBConnection();

    // Initialize Repo
    const masterMenuItemRepo = await newMasterMenuItemRepo();
    const outletRepo = await newOutletRepo();
    const outletMenuItemRepo = await newOutletMenuItemRepo();
    const inventoryRepo = await newInventoryRepo();

    // Initialize Service
    const masterMenuItemService = await newMasterMenuItemService(masterMenuItemRepo);
    const outletService = await newOutletService(outletRepo);
    const outletMenuItemService = await newOutletMenuItemService(outletMenuItemRepo, outletRepo, masterMenuItemRepo);
    const inventoryService = await newInventoryService(inventoryRepo, outletRepo, masterMenuItemRepo);

    // Initialize Controller
    const masterMenuItemV1Controller = await newMasterMenuItemV1Controller(masterMenuItemService);
    const outletV1Controller = await newOutletV1Controller(outletService);
    const outletMenuItemV1Controller = await newOutletMenuItemV1Controller(outletMenuItemService);
    const inventoryV1Controller = await newInventoryV1Controller(inventoryService);

    // Initialize Router
    const v1Router = await newV1Router({
        masterMenuItemController: masterMenuItemV1Controller,
        outletController: outletV1Controller,
        outletMenuItemController: outletMenuItemV1Controller,
        inventoryController: inventoryV1Controller,
    });

    app.use(morgan("short"));
    app.use("/api/v1", v1Router);
    app.use(globalErrorHandler);
})();

export default app;
