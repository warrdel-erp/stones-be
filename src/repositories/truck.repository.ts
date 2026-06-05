import * as models from "../models";
import { Op } from "sequelize";
import { scoped } from "../utils/scoped";
import { DELIVERY_STATUS } from "../constants/tableTypes";

const driverInclude = {
  association: "driver",
  attributes: ["id", "username", "userid", "role"],
  include: [{ association: "account", attributes: ["email"] }],
};

const deliveryInclude = {
  association: "deliveries",
  required: false,
  where: {
    status: {
      [Op.in]: ["pending", "approved", "started"]
    }
  },
  include: [
    {
      association: "invoiceDeliveries",
      include: [
        {
          association: "packagingList",
          include: [
            {
              association: "salesOrder",
              include: [
                { association: "customer", as: "customer" }
              ]
            },
            {
              association: "salesOrderProducts",
              include: [
                {
                  association: "inventoryProduct"
                }
              ]
            },
            {
              association: "shippingAddress"
            }
          ]
        }
      ]
    }
  ]
};

export const findByRegistrationNumber = async (registrationNumber: string) => {
  return scoped(models.Truck).findOne({
    where: { registrationNumber },
  });
};

export const create = async (data: any) => {
  const truck = await scoped(models.Truck).create(data);
  return findById(truck.get("id") as number);
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
        where: { status: { [Op.notIn]: [DELIVERY_STATUS.REJECTED, DELIVERY_STATUS.COMPLETED] } },
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
    include: [driverInclude, deliveryInclude],
  });
};

export const findById = async (id: number) => {
  return scoped(models.Truck).findOne({
    where: { id },
    include: [driverInclude, deliveryInclude],
  });
};

export const findByIdSimple = async (id: number) => {
  return scoped(models.Truck).findByPk(id);
};

export const findByDriverUserId = async (driverUserId: number) => {
  return scoped(models.Truck).findOne({
    where: { driverUserId },
    include: [driverInclude],
  });
};

export const update = async (id: number, data: any) => {
  await scoped(models.Truck).update(data, { where: { id } });
  return findById(id);
};

export const remove = async (id: number) => {
  return scoped(models.Truck).destroy({ where: { id } });
};
