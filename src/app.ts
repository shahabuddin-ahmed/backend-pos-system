import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { newV1Router } from "./web/router/v1/index";
import { newMasterMenuItemV1Controller } from "./web/controller/v1/masterMenuItem";
import { globalErrorHandler } from "./web/middleware/global-error-handler";
import { initializeDBConnection } from "./infra/db";
import { newMasterMenuItemRepo } from "./repo/masterMenuItem";
import { newMasterMenuItemService } from "./service/masterMenuItem";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    await initializeDBConnection();

    // Initialize Repo
    const masterMenuItemRepo = await newMasterMenuItemRepo();

    // Initialize Service
    const masterMenuItemService = await newMasterMenuItemService(masterMenuItemRepo);

    // Initialize Controller
    const masterMenuItemV1Controller = await newMasterMenuItemV1Controller(masterMenuItemService);

    // Initialize Router
    const v1Router = await newV1Router({
        outletMenuItemController: masterMenuItemV1Controller,
    });

    app.use(morgan("short"));
    app.use("/api/v1", v1Router);
    app.use(globalErrorHandler);
})();

export default app;
