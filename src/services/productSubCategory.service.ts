import * as productSubCategoryRepository from "../repositories/productSubCategory.repository";

export const create = async (data: any) => {
    return await productSubCategoryRepository.createProductSubCategory(data);
};

export const getAll = async (clientId: number) => {
    return await productSubCategoryRepository.getAllProductSubCategories(clientId);
};

export const getOne = async (id: number, clientId: number) => {
    return await productSubCategoryRepository.getProductSubCategoryById(id, clientId);
};

export const update = async (id: number, data: any) => {
    return await productSubCategoryRepository.updateProductSubCategory(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await productSubCategoryRepository.deleteProductSubCategory(id, clientId);
};