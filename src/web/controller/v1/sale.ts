import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { SaleServiceInterface } from "../../../service/sale";

export interface SaleControllerInterface {
    create(req: Request, res: Response): Promise<any>;
}

export class SaleController extends Controller implements SaleControllerInterface {
    constructor(private service: SaleServiceInterface) {
        super();
        this.service = service;
        this.create = this.create.bind(this);
    }

    async create(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            outletId: Joi.number().integer().positive().required(),
            items: Joi.array().items(Joi.object({
                masterMenuItemId: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().positive().required()
            })).min(1).required()
        });
        const { value } = await this.validateRequest(schema, req.body);
        const data = await this.service.createSale(value);
        return this.sendResponse({ response: data }, 201, res);
    }
}

export const newSaleV1Controller = async (service: SaleServiceInterface): Promise<SaleController> => {
    return new SaleController(service);
};
