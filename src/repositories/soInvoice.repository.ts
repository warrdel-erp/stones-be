import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { SoInvoice } from "../models/salesOrderInvoice.model";
import { Op, fn, col } from "sequelize";
import { Sequelize } from "sequelize";
import { RETURN_STATUS } from "../models/return.model";
import SalesOrderProduct from "../models/salesOrderProduct.model";
import ReturnProduct from "../models/returnProduct.model";
import Return from "../models/return.model";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
  return await models.SalesOrderInvoice.create(data, { transaction });
};

/**
 * Fetch all invoices
 */
export const getAllInvoicesList = async (
  clientId: number,
  filter: any,
  page: number,
  limit: number,
  truckOnly?: boolean,
  transaction?: Transaction
) => {
  const offset = (page - 1) * limit;

  console.log(truckOnly)

  if (truckOnly) {
    filter.truckId = {
      [Op.ne]: null
    }
  }

  return await models.SalesOrderInvoice.findAndCountAll({
    where: {
      ...filter,
      clientId,

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
        ],
      },
      {
        association: 'returns',
        include: [
          {
            association: 'returnProducts',
            include: [
              {
                association: 'salesOrderProduct',
                include: [

                  {
                    association: "inventoryProduct",
                    include: [
                      {
                        association: 'slab',
                        attributes: ['combinedSlabNumber']
                      }
                    ]
                  }
                ]
              },
            ]
          }
        ]
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
        include: [
          {
            model: models.SalesOrder,
            as: "salesOrder",
          },
          {
            model: models.PackagingList,
            as: "packagingList",
          },
          {
            model: models.SalesOrderProduct,
            as: "salesOrderProducts",
          },
        ],
      },
    ],
    transaction,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true
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
  await models.SalesOrderInvoice.update({ truckId, truckAssignedOn: new Date() }, { where: { id } });
};

export const getInvoiceById = async (id: number, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findByPk(id, {
    transaction,
  });
};

export const getInvoiceDetailsById = async (id: number, transaction?: Transaction) => {
  return await models.SalesOrderInvoice.findByPk(id, {
    include: [
      {
        association: "client",
        include: [
          {
            association: "company",
          },
        ],
      },
      {
        association: "loadingOrder",
        include: [
          {
            association: "salesOrderProducts",
            include: [
              {
                association: "inventoryProduct",
                include: [
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
            ],
          },
          {
            association: "packagingList"
          },
          {
            association: "shippingAddress",
          },
          {
            association: "salesOrder",
            include: ['customer']
          }
        ],
      },
      {
        association: "customer",
        include: [
          {
            association: "billingAddress",
          },
          {
            association: "primarySalesPerson",
          },
        ],
      },
    ],
    transaction,
  });
};

/**
 * Get list of sales order products that don't have initiated or completed returns for a specific invoice
 */
export const getSalesOrderProductsWithoutReturns = async (
  soInvoiceId: number,
  filter: WhereOptions = {},
  transaction?: Transaction
) => {
  // First get all sales order products for the invoice
  const allProducts = await models.SalesOrderProduct.findAll({
    where: {
      ...filter,
      '$loadingOrder.salesOrderInvoice.id$': soInvoiceId
    },
    include: [
      {
        model: models.LoadingOrder,
        as: 'loadingOrder',
        include: [
          {
            model: models.SalesOrderInvoice,
            as: 'salesOrderInvoice',
            attributes: ['id']
          },
          {
            association: "packagingList"
          }
        ]
      },
      {
        model: models.ReturnProduct,
        as: 'returnProducts',
        include: [
          {
            model: models.Return,
            as: 'return',
            attributes: ['id', 'status']
          }
        ]
      },
      {
        model: models.InventoryProduct,
        as: 'inventoryProduct',
        include: [
          {
            model: models.Slab,
            as: 'slab',
            include: [
              {
                model: models.Product,
                as: 'product'
              }
            ]
          }
        ]
      }
    ],
    transaction
  });

  // Filter out products that have returns with status other than COMPLETE or INITIATED
  return allProducts.filter(product => {

    const returnProducts = product.get('returnProducts') as any[];

    // keep product if return product does not exists.
    if (!returnProducts?.length) {
      return true;
    }

    // keep product if every return product is canceled previously
    return returnProducts.every(rp => {
      const returnData = rp.get('return');
      return returnData.status === RETURN_STATUS.CANCELLED
    })

  });
};
