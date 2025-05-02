import * as productCategoryRepository from "../repositories/productCategory.repository";

export const create = async (data: any) => {
    return await productCategoryRepository.createProductCategory(data);
};

export const getAll = async (clientId: number) => {
    return await productCategoryRepository.getAllProductCategories(clientId);
};

export const getOne = async (id: number, clientId: number) => {
    return await productCategoryRepository.getProductCategoryById(id, clientId);
};

export const update = async (id: number, data: any) => {
    return await productCategoryRepository.updateProductCategory(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await productCategoryRepository.deleteProductCategory(id, clientId);
};

export const getTotalSlabMetricByCategory = async (clientId: number) => {
    return await productCategoryRepository.getTotalSlabMetricByCategory(clientId);
};