import * as productGroupRepository from "../repositories/productGroup.repository";

export const create = async (data: any) => {
    return await productGroupRepository.create(data);
};

export const getAll = async (clientId: number) => {
    return await productGroupRepository.findAll(clientId);
};

export const getById = async (id: string, clientId: number) => {
    return await productGroupRepository.findById(id, clientId);
};

export const update = async (id: string, data: any) => {
    return await productGroupRepository.update(id, data);
};

export const remove = async (id: string, clientId: number) => {
    return await productGroupRepository.removeById(id, clientId);
};