import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as productSubCategoryService from "../services/productSubCategory.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createProductSubCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const payload = { ...req.body, clientId: req.user?.clientId };

    const subCategory = await productSubCategoryService.create(payload);
    SuccessResponse(res, 201, "Product SubCategory created", subCategory);
});

export const getAllProductSubCategories = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const subCategories = await productSubCategoryService.getAll(Number(clientId));
    SuccessResponse(res, 200, "Product SubCategories fetched", subCategories);
});

export const getProductSubCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const subCategory = await productSubCategoryService.getOne(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Product SubCategory details", subCategory);
});

export const updateProductSubCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const subCategory = await productSubCategoryService.update(+req.params.id, req.body);
    SuccessResponse(res, 200, "Product SubCategory updated", subCategory);
});

export const deleteProductSubCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    await productSubCategoryService.remove(+req.params.id, Number(clientId));
    SuccessResponse(res, 200, "Product SubCategory deleted", {});
});