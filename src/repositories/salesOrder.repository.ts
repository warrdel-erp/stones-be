import { Transaction } from "sequelize";
import * as models from "../models";

// Create new Sales Order
export const createSalesOrder = async (data: any, transaction?: Transaction) => {
  return await models.SalesOrder.create(data, { transaction });
};

// Get all sales order
export const getAllSalesOrders = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const { rows: data, count: total } = await models.SalesOrder.findAndCountAll({
    include: [
      { model: models.Customer, as: "customer" },
      { model: models.User, as: "createdBy" },
      { model: models.CustomerAddress, as: "shippingAddress" },
      { model: models.Location, as: "soLocation" },
      { model: models.Notes, as: "notes" },
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
      { model: models.Customer, as: "customer" },
      { model: models.User, as: "createdBy" },
      { model: models.CustomerAddress, as: "shippingAddress" },
      { model: models.Notes, as: "notes" },
      {
        model: models.SalesOrderProduct,
        as: "salesOrderProducts",
        include: [
          {
            model: models.InventoryProduct,
            as: "inventoryProduct",
            include: [
              {
                model: models.Slab,
                as: "slab",
                include: [
                  {
                    model: models.Product,
                    as: "product",
                  },
                ],
              },
            ],
          },
          { model: models.LoadingOrder, as: "loadingOrder" },
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
