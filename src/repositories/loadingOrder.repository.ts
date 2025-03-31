import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

// Create new LO
export const createLoadingOrder = async (data: any) => {
  return await models.LoadingOrder.create(data);
};

// Get all LO
export const getAllLoadingOrders = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const { rows: data, count: total } = await models.LoadingOrder.findAndCountAll({
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.LoadingOrderProduct, as: "loadingOrderProducts" },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { data, total, page, limit };
};

// Get all LO without pagination
export const getAllLoadingOrdersWithoutPagination = async (filters: WhereOptions) => {
  const loadingOrders = await models.LoadingOrder.findAll({
    where: filters,
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.SalesOrderProduct, as: "salesOrderProducts" },
      { model: models.PackagingList, as: "packagingList" },
    ],
  });

  return loadingOrders;
};

// Get loading order by Id
export const getLoadingOrderById = async (id: number) => {
  const loadingOrder = await models.LoadingOrder.findByPk(id, {
    include: [
      {
        model: models.SalesOrder,
        as: "salesOrder",
        include: [
          { model: models.Customer, as: "customer" },
          { model: models.CustomerAddress, as: "shippingAddress" },
        ],
      },
      {
        model: models.SalesOrderProduct,
        as: "salesOrderProducts",
        required: false,
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
        ],
      },
      {
        model: models.PackagingList,
        as: "packagingList",
        include: [{ model: models.SalesOrderProduct, as: "salesOrderProducts" }],
      },
    ],
  });

  return loadingOrder?.get({ plain: true });
};

// Get loading order by Id
export const getLoadingOrderByIdSimple = async (id: number) => {
  return await models.LoadingOrder.findByPk(id);
};

// Get loading order by SO id
export const getLoadingOrdersBySalesOrderId = async (salesOrderId: number) => {
  return await models.LoadingOrder.findAll({
    where: { salesOrderId },
    include: [
      { model: models.SalesOrder, as: "salesOrder" },
      { model: models.LoadingOrderProduct, as: "loadingOrderProducts" },
    ],
  });
};

// Update Loading Order
export const updateLoadingOrder = async (id: number, data: any, transaction?: Transaction) => {
  const loadingOrder = await models.LoadingOrder.update(data, { where: { id }, transaction, individualHooks: true });
  return loadingOrder;
};

// Get latest SO number
export const getLoNumber = async (clientId: number) => {
  const lastLO: any = await models.LoadingOrder.findOne({
    where: { clientId },
    order: [["clientLoNumber", "DESC"]],
    attributes: ["clientLoNumber"],
  });

  return { clientLoNumber: lastLO ? lastLO?.clientLoNumber + 1 : 1 };
};
