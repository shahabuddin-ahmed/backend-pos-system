import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { SaleServiceInterface } from "../../../service/sale";
import { ReportPeriod } from "../../../service/reportPeriod";

export interface ReportControllerInterface {
    revenueByOutlet(req: Request, res: Response): Promise<any>;
    topItemsByOutlet(req: Request, res: Response): Promise<any>;
    summary(req: Request, res: Response): Promise<any>;
}

export class ReportController extends Controller implements ReportControllerInterface {
    constructor(private service: SaleServiceInterface) {
        super();
        this.service = service;
        this.revenueByOutlet = this.revenueByOutlet.bind(this);
        this.topItemsByOutlet = this.topItemsByOutlet.bind(this);
        this.summary = this.summary.bind(this);
    }

    async revenueByOutlet(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            period: Joi.string().valid("today", "thisMonth", "lifetime").default("lifetime")
        });
        const { value } = await this.validateRequest(schema, req.query);
        const data = await this.service.revenueByOutlet(value.period as ReportPeriod);
        return this.sendResponse({ response: data }, 200, res);
    }

    async topItemsByOutlet(req: Request, res: Response): Promise<any> {
        const paramsSchema = Joi.object({ outletId: Joi.number().integer().positive().required() });
        const querySchema = Joi.object({
            period: Joi.string().valid("today", "thisMonth", "lifetime").default("lifetime")
        });
        const { value: params } = await this.validateRequest(paramsSchema, req.params);
        const { value: query } = await this.validateRequest(querySchema, req.query);
        const data = await this.service.topItemsByOutlet(params.outletId, query.period as ReportPeriod);
        return this.sendResponse({ response: data }, 200, res);
    }

    async summary(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            period: Joi.string().valid("today", "thisMonth", "lifetime").default("lifetime"),
            outletId: Joi.number().integer().positive().optional()
        });
        const { value } = await this.validateRequest(schema, req.query);
        const data = await this.service.reportSummary(value.period as ReportPeriod, value.outletId);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newReportV1Controller = async (service: SaleServiceInterface): Promise<ReportController> => {
    return new ReportController(service);
};
