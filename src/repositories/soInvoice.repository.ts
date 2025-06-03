import { Transaction, where, WhereOptions } from "sequelize";
import * as models from "../models";
import { SoInvoice } from "../models/salesOrderInvoice.model";
import { Op, fn, col } from "sequelize";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
  return await models.SalesOrderInvoice.create(data, { transaction });
};

/**
 * Fetch all invoices
 */
export const getAllInvoicesList = async (clientId: number, filter: WhereOptions, page: number, limit: number, transaction?: Transaction) => {
  const offset = (page - 1) * limit;

  return await models.SalesOrderInvoice.findAndCountAll({
    where: {
      ...filter,
      clientId
    },
    include: [
      {
        model: models.Truck,
        as: "truck",
      },
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name", "primaryPhoneNumber", "secondaryPhoneNumber"],
        include: [
          {
            model: models.CustomerAddress,
            as: "addresses",
          },
        ]
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
        include: [
          {
            model: models.SalesOrder,
            as: "salesOrder"
          },
          {
            model: models.PackagingList,
            as: "packagingList"
          },
          {
            model: models.SalesOrderProduct,
            as: "salesOrderProducts"
          },
        ]
      },
    ],
    transaction,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Fetch all invoices
 */
export const getAllInvoices = async (filter: WhereOptions, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findAll({
    where: filter,
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name"],
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
      },
    ],
    transaction,
  });
};

export const getTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {

  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const result: any = await models.SalesOrderInvoice.findOne({
    attributes: [[fn("SUM", col("amount")), "totalAmount"]],
    where: {
      clientId,
      createdAt: {
        [Op.between]: [from, to],
      },
    },
    raw: true,
  });

  return result?.totalAmount ?? 0;
};

export const getTotalAmountForClient = async (clientId: number) => {
  const result: any = await models.SalesOrderInvoice.findOne({
    attributes: [[fn("SUM", col("amount")), "totalAmount"]],
    where: {
      clientId,
    },
    raw: true,
  });

  return result?.totalAmount ?? 0;
};

export const assignTruck = async (id: number, truckId: number) => {
  await models.SalesOrderInvoice.update({ truckId, truckAssignedOn: new Date() }, { where: { id } })
}

export const getInvoiceById = async (id: number, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findByPk(id, {
    transaction,
  });
};

export const getInvoiceDetailsById = async (id: number, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findByPk(id, {
    include: [
      {
        association: 'client',
        include: [
          {
            association: 'company'
          }
        ]
      },
      {
        association: 'loadingOrder',
        include: [
          {
            association: 'salesOrderProducts',
            include: [
              {
                association: 'inventoryProduct',
                include: [
                  {
                    association: 'slab',
                    include: [
                      {
                        association: 'product'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            association: 'shippingAddress'
          },
        ]
      },
      {
        association: 'customer',
        include: [
          {
            association: 'billingAddress',
          },
          {
            association: 'primarySalesPerson'
          }
        ]
      }
    ],
    transaction,
  });
};
