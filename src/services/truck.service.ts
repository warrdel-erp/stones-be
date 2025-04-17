import * as truckRepository from "../repositories/truck.repository";

export const createTruck = async (data: any) => {
  return truckRepository.create(data);
};

export const getAllTrucks = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  return await truckRepository.findAll(page, limit, filters);
};

export const getTruckById = async (id: number) => {
  return truckRepository.findById(id);
};

export const updateTruck = async (id: number, data: any) => {
  return truckRepository.update(id, data);
};

export const deleteTruck = async (id: number) => {
  return truckRepository.remove(id);
};
