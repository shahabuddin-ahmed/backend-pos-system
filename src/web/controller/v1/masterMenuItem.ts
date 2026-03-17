import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { MasterMenuItemServiceInterface } from "../../../service/masterMenuItem";

export interface MasterMenuItemControllerInterface {
    create(req: Request, res: Response): Promise<any>;
    list(req: Request, res: Response): Promise<any>;
    getById(req: Request, res: Response): Promise<any>;
    update(req: Request, res: Response): Promise<any>;
}

export class MasterMenuItemController extends Controller implements MasterMenuItemControllerInterface {
    constructor(private service: MasterMenuItemServiceInterface) {
        super();
        this.service = service;
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
    }

    async create(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            name: Joi.string().required(),
            sku: Joi.string().required(),
            basePrice: Joi.number().positive().required(),
            isActive: Joi.boolean().optional()
        });
        const { value } = await this.validateRequest(schema, req.body);
        const data = await this.service.create(value);
        return this.sendResponse({ response: data }, 201, res);
    }

    async list(req: Request, res: Response): Promise<any> {
        const data = await this.service.list();
        return this.sendResponse({ response: data }, 200, res);
    }

    async getById(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            id: Joi.number().integer().positive().required(),
        });
        const { value } = await this.validateRequest(schema, req.params);
        const data = await this.service.getById(value.id);
        return this.sendResponse({ response: data }, 200, res);
    }

    async update(req: Request, res: Response): Promise<any> {
        const paramsSchema = Joi.object({
            id: Joi.number().integer().positive().required(),
        });
        const bodySchema = Joi.object({
            name: Joi.string().optional(),
            basePrice: Joi.number().positive().optional(),
            isActive: Joi.boolean().optional()
        }).or("name", "basePrice", "isActive");

        const { value: params } = await this.validateRequest(paramsSchema, req.params);
        const { value: body } = await this.validateRequest(bodySchema, req.body);
        const data = await this.service.update(params.id, body);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newMasterMenuItemV1Controller = async (service: MasterMenuItemServiceInterface): Promise<MasterMenuItemController> => {
    return new MasterMenuItemController(service);
};
