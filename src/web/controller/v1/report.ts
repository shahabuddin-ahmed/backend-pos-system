import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { SaleServiceInterface } from "../../../service/sale";

export interface ReportControllerInterface {
    revenueByOutlet(req: Request, res: Response): Promise<any>;
    topItemsByOutlet(req: Request, res: Response): Promise<any>;
}

export class ReportController extends Controller implements ReportControllerInterface {
    constructor(private service: SaleServiceInterface) {
        super();
        this.service = service;
        this.revenueByOutlet = this.revenueByOutlet.bind(this);
        this.topItemsByOutlet = this.topItemsByOutlet.bind(this);
    }

    async revenueByOutlet(_req: Request, res: Response): Promise<any> {
        const data = await this.service.revenueByOutlet();
        return this.sendResponse({ response: data }, 200, res);
    }

    async topItemsByOutlet(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({ outletId: Joi.number().integer().positive().required() });
        const { value } = await this.validateRequest(schema, req.params);
        const data = await this.service.topItemsByOutlet(value.outletId);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newReportV1Controller = async (service: SaleServiceInterface): Promise<ReportController> => {
    return new ReportController(service);
};
