import { Transaction } from "sequelize";
import * as models from "../models";
import { sequelize } from "../config/database";
import { SALES_ORDER_STATUS } from "../constants/tableTypes";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await models.SalesOrder.create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async (page: number, limit: number, clientId: number,) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    where: {
      clientId,
    },
    attributes: {
      include: [
        [
          // Count the number of associated Loading Orders
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM loading_orders AS lo
            WHERE lo.salesOrderId = SalesOrder.id
          )`),
          "loadingOrderCount",
        ],
      ],
    },
    include: [
      { model: models.Customer, as: "customer", attributes: ["id", "salesTax", "scope", "daysForHold", "name"] },
      { model: models.User, as: "createdBy", attributes: ["id", "username"] },
      { model: models.Location, as: "soLocation", attributes: ["id", "location"] },
      { model: models.Notes, as: "notes" },
      {
        model: models.SalesOrderProduct,
        as: "salesOrderProducts",
        attributes: ["id", "unitPrice"],
        include: [
          {
            model: models.InventoryProduct,
            as: "inventoryProduct",
            attributes: ["id"],
            include: [
              {
                model: models.Slab,
                as: "slab",
                attributes: ["id", "receivingLength", "receivingWidth"],
              },
            ],
          },
        ],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get One SO
export const getSalesOrderById = async (id: number) => {
  return await models.SalesOrder.findOne({
    where: { id },
    include: [
      { association: "customer" },
      { association: "createdBy" },
      { association: "shippingAddress" },
      { association: "notes" },
      { association: "soLocation", attributes: ["id", "location"] },
      {
        association: "salesOrderProducts",
        include: [
          {
            association: "inventoryProduct",
            include: [
              {
                association: "bin",
                attributes: ['id', 'name'],
              },
              {
                association: "slab",
                include: [
                  {
                    association: "product",
                  },
                ],
              },
            ],
          },
          {
            association: "loadingOrder",
          },
          { model: models.PackagingList, as: "packagingList" },
        ],
      },
    ],
  });
};

// Get latest SO number
export const getSoNumber = async (clientId: number) => {
  const lastSO: any = await models.SalesOrder.findOne({
    where: { clientId },
    order: [["clientSoNumber", "DESC"]],
    attributes: ["clientSoNumber"],
  });

  return { clientSoNumber: lastSO ? lastSO?.clientSoNumber + 1 : 1 };
};

// Get all open SO by clientId
export const countOpenSOByClientId = async (clientId: number) => {
  return await models.SalesOrder.count({
    where: {
      clientId,
      status: SALES_ORDER_STATUS.OPEN,
    },
  });
};
