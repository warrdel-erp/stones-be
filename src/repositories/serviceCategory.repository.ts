import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createServiceCategory = async (payload: any) => {
    return await scoped(models.ServiceCategory).create(payload);
};

export const getAllServiceCategories = async (clientId: number) => {
    return await scoped(models.ServiceCategory).findAll({ where: { clientId } });
};

export const getServiceCategoryById = async (id: number, clientId: number) => {
    return await scoped(models.ServiceCategory).findOne({ where: { id, clientId } });
};

export const updateServiceCategory = async (id: number, data: any) => {
    return await scoped(models.ServiceCategory).update(data, { where: { id } });
};

export const deleteServiceCategory = async (id: number, clientId: number) => {
    return await scoped(models.ServiceCategory).destroy({ where: { id, clientId } });
}; 