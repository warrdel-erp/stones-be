import { Op, Transaction, WhereOptions, col, fn } from "sequelize";
import * as models from "../models";
import CustomerAddress from "../models/customerAddress.model";
import PackagingList from "../models/packagingList.model";
import Location from "../models/location.model";
import { RETURN_STATUS } from "../models/return.model";
import SalesOrder from "../models/salesOrder.model";
import { SoInvoice } from "../models/salesOrderInvoice.model";
import { scoped } from "../utils/scoped";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
  return await scoped(models.SalesOrderInvoice).create(data, { transaction });
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
  const offset = (Number(page) - 1) * Number(limit);
  const { search, ...otherFilters } = filter;

  if (truckOnly) {
    otherFilters.truckId = {
      [Op.ne]: null
    }
  }

  const whereClause: any = {
    ...otherFilters,
    clientId,
  };

  if (search) {
    whereClause[Op.or] = [
      { invoiceCode: { [Op.like]: `%${search}%` } },
      { "$customer.name$": { [Op.like]: `%${search}%` } }
    ];
  }

  return await scoped(models.SalesOrderInvoice).findAndCountAll({
    where: whereClause,
    include: [
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
                    attributes: ['combinedNumber'],
                    include: [
                      {
                        association: 'slab',
                        attributes: ['id']
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
        model: models.PackagingList,
        as: "packagingList",
        include: [
          {
            association: "salesOrder",
            include: ['soLocation', 'shippingAddress']
          },
          {
            model: models.LoadingOrder,
            as: "loadingOrders",
          },
          {
            model: models.SalesOrderProduct,
            as: "salesOrderProducts",
          },
        ],
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
        include: [
          {
            model: models.SalesOrderProduct,
            as: "salesOrderProducts",
          }
        ]
      }
    ],
    transaction,
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true
  });
};

/**
 * Fetch all invoices
 */
export const getAllInvoices = async (filter: WhereOptions, transaction?: Transaction) => {
  return await scoped(models.SalesOrderInvoice).findAll({
    where: filter,
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name"],
      },
      {
        model: models.PackagingList,
        as: "packagingList",
      },
      {
        model: models.LoadingOrder,
        as: "loadingOrder",
      },
      {
        association: 'advancedDepositSettlements',
        attributes: ['id'],
        include: [
          {
            association: 'advancedDeposit',
            attributes: ['id', 'code']
          }
        ]
      }
    ],
    transaction,
  });
};

/**
 * Fetch all invoices
 */
export const getCustomerAllInvoicesOptions = async (filter: WhereOptions, transaction?: Transaction) => {
  return await scoped(models.SalesOrderInvoice).findAll({
    attributes: [["id", 'value'], ["invoiceCode", 'label']],
    where: filter,
    transaction,
  });
};

export const getTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999);

  const result: any = await scoped(models.SalesOrderInvoice).findOne({
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
  const result: any = await scoped(models.SalesOrderInvoice).findOne({
    attributes: [[fn("SUM", col("amount")), "totalAmount"]],
    where: {
      clientId,
    },
    raw: true,
  });

  return result?.totalAmount ?? 0;
};

export const assignTruck = async (id: number, truckId: number) => {
  await scoped(models.SalesOrderInvoice).update({ truckId, truckAssignedOn: new Date() }, { where: { id } });
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
        association: "packagingList",
        include: [
          {
            association: 'tradeServices',
            include: [
              {
                association: 'service'
              }
            ]
          },
          {
            association: "salesOrderProducts",
            include: [
              {
                association: "inventoryProduct",

                include: [
                  {
                    association: "product",
                  },
                  {
                    association: "slab",
                  },
                  {
                    association: "genericProduct",
                  },
                ],
              },
            ],
          },
          {
            association: "loadingOrders"
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
      {
        association: "loadingOrder",
        include: [
          {
            association: "salesOrderProducts",
            include: [
              {
                association: "inventoryProduct",
                include: [
                  { association: "product" },
                  { association: "slab" },
                  { association: "genericProduct" },
                ],
              }
            ]
          },
          {
            association: "salesOrder",
            include: ['customer', 'shippingAddress', 'soLocation']
          }
        ]
      }
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
  const allProducts = await scoped(models.SalesOrderProduct).findAll({
    where: {
      ...filter,
      '$packagingList.salesOrderInvoice.id$': soInvoiceId
    },
    include: [
      {
        model: models.PackagingList,
        as: 'packagingList',
        include: [
          {
            model: models.SalesOrderInvoice,
            as: 'salesOrderInvoice',
            attributes: ['id']
          },
          {
            association: "loadingOrders"
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
  return allProducts.filter((product: any) => {

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

export const findSoInvoiceWithAssociations = async (soInvoiceId: number, transaction?: any) => {
  return await models.SalesOrderInvoice.findByPk(soInvoiceId, {
    include: [{
      model: PackagingList,
      as: "packagingList",
      include: [{
        model: SalesOrder,
        as: "salesOrder",
        include: [
          { model: Location, as: "soLocation" },
          { model: CustomerAddress, as: "shippingAddress" }
        ]
      }]
    }],
    transaction
  });
};

export const getOverdueInvoicesRaw = async (clientId: number, customerId?: number, transaction?: Transaction) => {
  const where: any = {};
  if (customerId) {
    where.customerId = customerId;
  }
  return await scoped(models.SalesOrderInvoice).findAll({
    where,
    include: [
      {
        model: models.Customer,
        as: "customer",
        attributes: ["id", "name"],
      },
      {
        model: models.PackagingList,
        as: "packagingList",
        include: [
          {
            model: models.SalesOrder,
            as: "salesOrder",
            attributes: ["id", "paymentTermId"],
          }
        ]
      }
    ],
    transaction,
  });
};
