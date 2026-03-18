import Joi from "joi";
import { Request, Response } from "express";
import { Controller } from "../controller";
import { OutletServiceInterface } from "../../../service/outlet";

export interface OutletControllerInterface {
    create(req: Request, res: Response): Promise<any>;
    list(req: Request, res: Response): Promise<any>;
    getById(req: Request, res: Response): Promise<any>;
    updateById(req: Request, res: Response): Promise<any>;
}

export class OutletController extends Controller implements OutletControllerInterface {
    constructor(private outletService: OutletServiceInterface) {
        super();
        this.outletService = outletService;
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.getById = this.getById.bind(this);
        this.updateById = this.updateById.bind(this);
    }

    async create(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            name: Joi.string().required(),
            code: Joi.string().required(),
            location: Joi.string().allow("", null).optional(),
            isActive: Joi.boolean().optional()
        });

        const { value } = await this.validateRequest(schema, req.body);
        const data = await this.outletService.create(value);
        return this.sendResponse({ response: data }, 201, res);
    }

    async list(_req: Request, res: Response): Promise<any> {
        const data = await this.outletService.list();
        return this.sendResponse({ response: data }, 200, res);
    }

    async getById(req: Request, res: Response): Promise<any> {
        const schema = Joi.object({
            id: Joi.number().integer().positive().required(),
        });
        const { value } = await this.validateRequest(schema, req.params);
        const data = await this.outletService.getById(value.id);
        return this.sendResponse({ response: data }, 200, res);
    }

    async updateById(req: Request, res: Response): Promise<any> {
        const paramsSchema = Joi.object({
            id: Joi.number().integer().positive().required(),
        });
        const bodySchema = Joi.object({
            name: Joi.string().optional(),
            location: Joi.string().allow("", null).optional(),
            isActive: Joi.boolean().optional()
        }).or("name", "location", "isActive");
        const { value: params } = await this.validateRequest(paramsSchema, req.params);
        const { value: body } = await this.validateRequest(bodySchema, req.body);
        const data = await this.outletService.updateById(params.id, body);
        return this.sendResponse({ response: data }, 200, res);
    }
}

export const newOutletV1Controller = async (outletService: OutletServiceInterface): Promise<OutletController> => {
    return new OutletController(outletService);
};
