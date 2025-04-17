import * as models from "../models";

export const create = async (data: any) => {
  return models.Truck.create(data);
};

export const findAll = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const offset = (page - 1) * limit;

  // Build where clause dynamically if filters are provided
  const whereClause = filters ? { ...filters } : {};

  return await models.Truck.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
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
