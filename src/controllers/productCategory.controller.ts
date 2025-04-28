import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as productCategoryService from "../services/productCategory.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createProductCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const payload = { ...req.body, clientId: req.user?.clientId };

    const category = await productCategoryService.create(payload);
    SuccessResponse(res, 201, "Product Category created", category);
});

export const getAllProductCategories = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const categories = await productCategoryService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Product Categories fetched", categories);
});

export const getProductCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const category = await productCategoryService.getOne(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Product Category details", category);
});

export const updateProductCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const category = await productCategoryService.update(+req.params.id, req.body);
    SuccessResponse(res, 200, "Product Category updated", category);
});

export const deleteProductCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    await productCategoryService.remove(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Product Category deleted", {});
});
