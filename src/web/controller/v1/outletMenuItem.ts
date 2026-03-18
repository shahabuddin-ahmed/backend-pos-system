import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { OutletMenuItemServiceInterface } from "../../../service/outletMenuItem";

export interface OutletMenuItemControllerInterface {
    assign(req: Request, res: Response): Promise<any>;
    listByOutlet(req: Request, res: Response): Promise<any>;
}

export class OutletMenuItemController extends Controller implements OutletMenuItemControllerInterface {
    constructor(private service: OutletMenuItemServiceInterface) {
        super();
        this.service = service;
        this.assign = this.assign.bind(this);
        this.listByOutlet = this.listByOutlet.bind(this);
    }

    async assign(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            outletId: Joi.number().integer().positive().required(),
            masterMenuItemId: Joi.number().integer().positive().required(),
            overridePrice: Joi.number().positive().allow(null).optional(),
            isAvailable: Joi.boolean().optional()
        });
        const { value } = await this.validateRequest(schema, req.body);
        const data = await this.service.assign(value);
        return this.sendResponse({ response: data }, 200, res);
    }

    async listByOutlet(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({ outletId: Joi.number().integer().positive().required() });
        const { value } = await this.validateRequest(schema, req.params);
        const data = await this.service.listByOutlet(value.outletId);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newOutletMenuItemV1Controller = async (service: OutletMenuItemServiceInterface): Promise<OutletMenuItemController> => {
    return new OutletMenuItemController(service);
};
