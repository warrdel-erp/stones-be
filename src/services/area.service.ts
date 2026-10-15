import Area from "../models/area.model";
import { scoped } from "../utils/scoped";

export const createArea = async (data: any, clientId: number) => {
  return await scoped(Area).create({ ...data, clientId });
};

export const getAreasByWarehouse = async (warehouseId: number) => {
  return await scoped(Area).findAll({
    where: { warehouseId },
    order: [["createdAt", "DESC"]],
  });
};

export const getAreaById = async (id: number) => {
  return await scoped(Area).findOne({
    where: { id },
  });
};

export const updateArea = async (id: number, data: any) => {
  const [updatedCount] = await scoped(Area).update(data, {
    where: { id },
  });
  if (updatedCount > 0) {
    return await getAreaById(id);
  }
  return null;
};

export const deleteArea = async (id: number) => {
  return await scoped(Area).destroy({
    where: { id },
  });
};
