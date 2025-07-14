import * as serviceCategoryRepository from "../repositories/serviceCategory.repository";

export const create = async (data: any) => {
    return await serviceCategoryRepository.createServiceCategory(data);
};

export const getAll = async (clientId: number) => {
    return await serviceCategoryRepository.getAllServiceCategories(clientId);
};

export const getOne = async (id: number, clientId: number) => {
    return await serviceCategoryRepository.getServiceCategoryById(id, clientId);
};

export const update = async (id: number, data: any) => {
    return await serviceCategoryRepository.updateServiceCategory(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await serviceCategoryRepository.deleteServiceCategory(id, clientId);
}; 