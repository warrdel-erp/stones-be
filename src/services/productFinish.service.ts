import * as productFinishRepository from "../repositories/productFinish.repository";

export const create = async (data: any) => {
    return await productFinishRepository.create(data);
};

export const getAll = async (clientId: number) => {
    return await productFinishRepository.findAll(clientId);
};

export const getById = async (id: string, clientId: number) => {
    return await productFinishRepository.findById(id, clientId);
};

export const update = async (id: string, data: any) => {
    return await productFinishRepository.update(id, data);
};

export const remove = async (id: string, clientId: number) => {
    return await productFinishRepository.removeById(id, clientId);
};