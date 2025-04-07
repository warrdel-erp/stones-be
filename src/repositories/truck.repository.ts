import * as models from "../models";

export const create = async (data: any) => {
  return models.Truck.create(data);
};

export const findAll = async () => {
  return models.Truck.findAll();
};

export const findById = async (id: number) => {
  return models.Truck.findByPk(id);
};

export const update = async (id: number, data: any) => {
  await models.Truck.update(data, { where: { id } });
  return findById(id);
};

export const remove = async (id: number) => {
  return models.Truck.destroy({ where: { id } });
};
