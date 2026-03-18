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

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    await initializeDBConnection();

    // Initialize Repo
    const masterMenuItemRepo = await newMasterMenuItemRepo();
    const outletRepo = await newOutletRepo();

    // Initialize Service
    const masterMenuItemService = await newMasterMenuItemService(masterMenuItemRepo);
    const outletService = await newOutletService(outletRepo);

    // Initialize Controller
    const masterMenuItemV1Controller = await newMasterMenuItemV1Controller(masterMenuItemService);
    const outletV1Controller = await newOutletV1Controller(outletService);

    // Initialize Router
    const v1Router = await newV1Router({
        outletMenuItemController: masterMenuItemV1Controller,
        outletController: outletV1Controller
    });

    app.use(morgan("short"));
    app.use("/api/v1", v1Router);
    app.use(globalErrorHandler);
})();

export default app;
