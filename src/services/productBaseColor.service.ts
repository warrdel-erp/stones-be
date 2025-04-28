import * as productBaseColorRepository from "../repositories/productBaseColor.repository";

export const create = async (data: any) => {
    return await productBaseColorRepository.create(data);
};

export const getAll = async (clientId: number) => {
    return await productBaseColorRepository.findAll(clientId);
};

export const getById = async (id: number, clientId: number) => {
    return await productBaseColorRepository.findById(id, clientId);
};

export const update = async (id: number, data: any) => {
    return await productBaseColorRepository.update(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await productBaseColorRepository.remove(id, clientId);
};
