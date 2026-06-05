import { AppError } from "../helper/appError";
import * as truckRepository from "../repositories/truck.repository";

export const createTruck = async (data: any) => {
  // check does truck registration number already exists for same client
  const existingTruck = await truckRepository.findByRegistrationNumber(data.registrationNumber);

  if (existingTruck) {
    throw new AppError("Truck registration number already exists.", 400);
  }

  if (data.driverUserId) {
    const truckWithDriver = await truckRepository.findByDriverUserId(data.driverUserId);
    if (truckWithDriver) {
      throw new AppError("The driver is already assigned to another truck.", 400);
    }
  }

  return truckRepository.create(data);
};

export const getAllTrucks = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  // Pass notAssignedOnly through to repository for special filtering
  return await truckRepository.findAll(page, limit, filters);
};

export const getTruckById = async (id: number) => {
  return truckRepository.findById(id);
};

export const getTruckByDriverUserId = async (driverUserId: number) => {
  return truckRepository.findByDriverUserId(driverUserId);
};

export const updateTruck = async (id: number, data: any) => {
  if (data.driverUserId) {
    const truckWithDriver = await truckRepository.findByDriverUserId(data.driverUserId);
    if (truckWithDriver && truckWithDriver.get('id') !== id) {
      throw new AppError("The driver is already assigned to another truck.", 400);
    }
  }

  return truckRepository.update(id, data);
};

export const deleteTruck = async (id: number) => {
  return truckRepository.remove(id);
};
