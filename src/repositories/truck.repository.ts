import * as models from "../models";
import { Op } from "sequelize";

export const create = async (data: any) => {
  return models.Truck.create(data);
};

export const findAll = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  const offset = (page - 1) * limit;

  // Build where clause dynamically if filters are provided
  const whereClause = { ...filters };

  // Remove notAssignedOnly from whereClause so it doesn't go to Truck's where
  const notAssignedOnly = whereClause.notAssignedOnly;
  delete whereClause.notAssignedOnly;

  // Build include for deliveries if notAssignedOnly is set to 'true' (string)
  const include = [];
  if (notAssignedOnly === 'true') {
    include.push({
      association: "deliveries",
      required: false,
      where: { status: "pending" },
      attributes: ["id"],
    });
  }

  // If notAssignedOnly, only return trucks with zero pending deliveries
  const having = notAssignedOnly === 'true'
    ? {
      [Op.or]: [
        { '$deliveries.id$': null }, // No deliveries at all
      ],
    }
    : undefined;

  return await models.Truck.findAndCountAll({
    where: whereClause,
    include: include.length ? include : undefined,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
    having,
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
