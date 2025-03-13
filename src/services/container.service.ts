import * as containerRepository from "../repositories/container.repository";

export const createContainer = async (data: any) => {
  return await containerRepository.createContainer(data);
};

export const getAllContainers = async () => {
  return await containerRepository.getAllContainers();
};

export const getContainerById = async (id: number) => {
  return await containerRepository.getContainerById(id);
};

export const updateContainer = async (id: number, data: any) => {
  return await containerRepository.updateContainer(id, data);
};

export const deleteContainer = async (id: number) => {
  return await containerRepository.deleteContainer(id);
};
