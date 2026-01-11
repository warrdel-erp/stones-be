import * as models from "../models";
import { Op } from "sequelize";
import { scoped } from "../utils/scoped";

export const create = async (data: any) => {
  return scoped(models.Truck).create(data);
};

export const findAll = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const offset = (page - 1) * limit;

  // Build where clause dynamically if filters are provided
  const whereClause = { ...filters };

  // Remove notAssignedOnly from whereClause so it doesn't go to Truck's where
  const notAssignedOnly = whereClause.notAssignedOnly;
  delete whereClause.notAssignedOnly;

  // If notAssignedOnly is true, find trucks that don't have pending deliveries
  if (notAssignedOnly === 'true') {
    const trucksWithPendingDeliveries = await scoped(models.Truck).findAll({
      include: [{
        association: "deliveries",
        where: { status: "pending" },
        attributes: [],
      }],
      attributes: ['id'],
      raw: true,
    });

    const truckIdsWithPendingDeliveries = trucksWithPendingDeliveries.map((truck: any) => truck.id);

    // Add condition to exclude trucks with pending deliveries
    whereClause.id = {
      [Op.notIn]: truckIdsWithPendingDeliveries
    };
  }

  return await scoped(models.Truck).findAndCountAll({
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
  await scoped(models.Truck).update(data, { where: { id } });
  return findById(id);
};

export const remove = async (id: number) => {
  return scoped(models.Truck).destroy({ where: { id } });
};
