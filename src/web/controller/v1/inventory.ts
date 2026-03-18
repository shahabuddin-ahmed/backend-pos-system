import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { InventoryServiceInterface } from "../../../service/inventory";

export interface InventoryControllerInterface {
    setStock(req: Request, res: Response): Promise<any>;
    listByOutlet(req: Request, res: Response): Promise<any>;
}

export class InventoryController extends Controller implements InventoryControllerInterface {
    constructor(private service: InventoryServiceInterface) {
        super();
        this.service = service;
        this.setStock = this.setStock.bind(this);
        this.listByOutlet = this.listByOutlet.bind(this);
    }

    async setStock(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            outletId: Joi.number().integer().positive().required(),
            masterMenuItemId: Joi.number().integer().positive().required(),
            currentStock: Joi.number().integer().min(0).required()
        });
        const { value } = await this.validateRequest(schema, req.body);
        const data = await this.service.setStock(value);
        return this.sendResponse({ response: data }, 200, res);
    }

    async listByOutlet(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({ outletId: Joi.number().integer().positive().required() });
        const { value } = await this.validateRequest(schema, req.params);
        const data = await this.service.listByOutlet(value.outletId);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newInventoryV1Controller = async (service: InventoryServiceInterface): Promise<InventoryController> => {
    return new InventoryController(service);
};
