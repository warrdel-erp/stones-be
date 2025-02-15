import { PaginatedData } from "../helpers/paginatedData.js";
import * as model from "../models/index.js";
import { JSON, Op, Sequelize, where } from "sequelize";
import { purchaseStatus } from "../constant.js";
import poSlabDetailModel from "../models/poSlabDetailModel.js";

export async function createOrder(data, t) {
  try {
    const options = t ? { transaction: t } : {};
    const result = await model.purchaseModel.create(data, options);
    return result;
  } catch (error) {
    console.error("Error in create order:", error);
    throw error;
  }
}

export async function updatePO(data, poNO) {
  try {
    const result = await model.purchaseModel.update(data, { where: { po: poNO } });
    return result;
  } catch (error) {
    console.error("Error in create order:", error);
    throw error;
  }
}

export async function latestPoNumber(clientId) {
  try {
    const attributes = ['po'];
    const result = await model.purchaseModel.findAll({
      attributes: attributes,
      order: [['created_at', 'DESC']],
      // limit: 1,
      include: [
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: clientId
          }
        },
      ]
    });
    return result.length;


  } catch (error) {
    console.log("Error getting PO Number: ", error);
    throw error;
  }
}

export async function updateOrder(poNumber, info) {
  console.log('PO Number:', poNumber); // Log the PO number for debugging
  try {
    // Update the order
    const result = await model.purchaseModel.update(info, {
      where: {
        purchaseOrderId: Number(poNumber)
      }
    });

    return result;
  } catch (error) {
    console.error("Error in updating order:", error);
    throw error;
  }
}


export async function findPoNumber(poNumber, clientId) {
  const result = await model.purchaseModel.findOne({
    where: {
      po: {
        [Op.eq]: poNumber
      },
    },
  })
  return result;
}

export async function createPurchaseProductOrder(data, transaction) {
  try {
    const result = await model.purchaseProductModel.create(data, {
      transaction: transaction
    });
    return result;
  } catch (error) {
    console.error("Error in create purchase product order:", error);
    throw error;
  }
}

export async function addOtherCharges(data, transaction) {
  try {
    if (Array.isArray(data)) {
      //  multiple records 
      const results = await model.productOtherCharges.bulkCreate(data, {
        transaction: transaction
      });
      return results;
      //single
    } else {
      const result = await model.productOtherCharges.create(data, { transaction });
      return result;
    }
  } catch (error) {
    console.error("Error in adding other charges:", error);
    throw new Error("Failed to add other charges. Please try again later.");
  }
}


export async function createPrePurchaseOrder(data, transaction) {
  try {
    const result = await model.prePurchaseModel.create(data,
      {
        transaction: transaction
      }
    );
    return result;
  } catch (error) {
    console.error("Error in create pre purchase order:", error);
    throw error;
  }
}

export async function getPrePurchaseOrder(data) {
  try {
    const result = await model.prePurchaseModel.findOne({
      where: {
        purchaseOrderProductId: {
          [Op.eq]: data
        }
      }
    });
    return result;
  } catch (error) {
    console.error("Error in create pre purchase order:", error);
    throw error;
  }
}


export async function singlePoDetails(poNumber) {
  try {
    const result = await model.purchaseModel.findOne({
      where: {
        po: poNumber,
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in ${poNumber}:`, error);
    throw error;
  }
}

// Create Supplier Invoice mapper table 

export async function createSupplierInvoiceMapper(data) {
  try {
    const result = await model.poSupplierInvoiceMapperModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add supplier Invoice mapper model:", error);
    throw error;
  }
}

// Create Supplier Invoice 

export async function createSupplierInvoice(data) {
  try {
    const result = await model.poSupplierInvoiceModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add supplier Invoice:", error);
    throw error;
  }
}

// get Single details

export async function getSinglePurchaseOrder(purchaseOrderId) {
  try {
    // Step 1: Fetch Landed Costs
    const landedCosts = await model.landedCostModel.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('AVG', Sequelize.col('product_landed_cost')), 'averageLandedCost'],
        [Sequelize.fn('MAX', Sequelize.col('created_at')), 'lastUpdatedAt'],
      ],
      group: ['productId'],
      raw: true,
    });

    const lastLandedCosts = await model.landedCostModel.findAll({
      attributes: [
        'productId',
        'productLandedCost',
      ],
      where: {
        createdAt: {
          [Op.eq]: Sequelize.literal("(SELECT MAX(`created_at`) FROM `product_landed_cost` WHERE `product_id` = `product_landed_cost`.`product_id`)")
        },
      },
      raw: true,
    });

    const averageCostMap = Object.fromEntries(
      landedCosts.map((cost) => [cost.productId, cost.averageLandedCost])
    );
    const lastCostMap = Object.fromEntries(
      lastLandedCosts.map((cost) => [cost.productId, cost.productLandedCost])
    );

    // Step 2: Fetch Purchase Order Details
    const result = await model.purchaseModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      include: [
        {
          model: model.productOtherCharges,
          as: 'productothercharges',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.supplierModel,
          as: 'suppliers',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.vendorModel,
          attributes: { include: ['vendorName', 'vendorType', 'vendorId'] },
        },
        {
          model: model.locationModel,
          as: 'location',
          foreignKey: 'location_id',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.locationModel,
          as: 'purchaseLocation',
          foreignKey: 'purchase_location_id',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.poSupplierInvoiceMapperModel,
          as: 'invoiceMapper',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },

          include: [
            {
              model: model.poSupplierInvoiceModel,
              as: 'supplierInvoice',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
            {
              model: model.containerModel,
              as: 'invoiceContainers',
            },
            {
              model: model.accountTransactionModel,
              as: 'poSupplierInvoice'
            }
          ],
        },
        {
          model: model.purchaseProductModel,
          as: 'purchaseProduct',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
          include: [
            {
              model: model.productModel,
              as: 'products',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
            {
              model: model.prePurchaseModel,
              as: 'prePurchase',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
          ],
        },
      ],
      where: {
        purchaseOrderId: purchaseOrderId,
      },
    });

    if (!result) {
      throw new Error(`Purchase order with ID ${purchaseOrderId} not found.`);
    }

    // Step 3: Enrich Result with Landed Costs
    const enrichedProducts = result.purchaseProduct.map((productEntry) => {
      const productId = productEntry.products?.productId;
      return {
        ...productEntry.toJSON(),
        averageLandedCost: averageCostMap[productId] || null,
        lastLandedCost: lastCostMap[productId] || null,
      };
    });

    // Replace `purchaseProduct` with enriched version
    const enrichedResult = {
      ...result.toJSON(),
      purchaseProduct: enrichedProducts,
    };

    return enrichedResult;
  } catch (error) {
    console.error(`Error in getting purchase order ID: ${purchaseOrderId}:`, error);
    throw error;
  }
}

// Get all purchase Order.
export async function getAllPurchaseOrder(data, limit, page) {
  try {
    const offset = (page - 1) * limit;

    // --------------- Applying Filters S -------------------
    let whereCondition = {};

    // If Search exists match it inside 'po'.
    if (data.search) {
      whereCondition.po = {
        [Op.like]: `%${data?.search}%`
      }
    }

    // Add status and location conditions.
    whereCondition = {
      ...whereCondition,
      ...(data.locationId && { locationId: data.locationId }),
    }

    // To get pending transaction POs
    if (data.status === "PENDING_PAYMENT") {
      whereCondition.purchaseOrderId = {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(select purchase_order_id from account_transaction WHERE purchase_order_id IS NOT NULL)` // Subquery to fetch IDs
        ),
      }
    } else if (data.status === "IN_TRANSIT") {
      whereCondition.container = {
        [Sequelize.Op.not]: null
      }
    }
    else if (data.status) {
      whereCondition.status = data.status
    }

    // --------------- Applying Filters E -------------------
    const result = await model.purchaseModel.findAndCountAll({
      where: whereCondition,
      attributes: [
        'po',
        'purchaseOrderId',
        'poDate',
        'requiredShipDate',
        'supplierSo',
        'container',
        'paymentTerm',
        'status',
        'purchaseLocationId',
        "createdAt",
        [
          Sequelize.literal(
            `(SELECT SUM(transaction_amount) 
                      FROM account_transaction 
                      WHERE account_transaction.purchase_order_id = purchase_orders.purchase_order_id)`
          ),
          'totalTransactionAmount'
        ],
        [
          Sequelize.fn('DATE', Sequelize.col('createdAt')),
          'createdDate'
        ],
        [
          Sequelize.fn('DATE', Sequelize.col('required_ship_date')),
          'requiredShipDateFormatted'
        ]
      ],
      include: [
        {
          model: model.poSupplierInvoiceMapperModel,
          as: 'invoiceMapper',
          include: [
            {
              model: model.containerModel,
              as: 'invoiceContainers'
            },
            {
              model: model.accountTransactionModel,
              as: 'poSupplierInvoice',
              where: {
                stage: {
                  [Op.in]: ['purchase']
                },
                transactionAmountType: 'debit',
              },
              // attributes: [
              //   'purchaseOrderId',
              //   [Sequelize.fn('SUM', Sequelize.col('transaction_amount')), 'total'] 
              // ],
              // group: ['purchaseOrderId'],
            }
          ]
        },
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: data.clientId
          }
        },
        {
          model: model.supplierModel,
          as: 'suppliers',
          attributes: ['supplierType', 'paymentTerm', 'supplierName']
        },
        {
          model: model.locationModel,
          as: 'location',
          attributes: ['location', 'purchaseLocation']
        },
        {
          model: model.locationModel,
          as: "purchaseLocation",
          // foreignKey: "purchase_location_id",
          attributes: ['location'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      subQuery: false,
      distinct: true
    });

    // fetching it separately because group does not work with pagination, And aggregation function SUM does not work without group.
    const totalQuantityArr = await model.purchaseModel.findAll({
      where: whereCondition,
      attributes: [
        "purchaseOrderId",
        [
          Sequelize.fn("SUM", Sequelize.col('purchaseProduct.prePurchase.po_qty')),
          "totalProductQty"
        ]
      ],
      include: [
        {
          model: model.purchaseProductModel,
          as: 'purchaseProduct',
          attributes: [],
          include: [
            {
              model: model.prePurchaseModel,
              as: 'prePurchase',
              attributes: [],
            },
          ],
        },
      ],
      offset,
      limit,
      subQuery: false,
      order: [['createdAt', 'DESC']],
      group: ['purchase_orders.purchase_order_id']
    });

    // Combine total product data to PO.
    result.rows = result.rows.map(e => {
      const plainObj = e.toJSON()
      return {
        ...plainObj,
        "totalProductQty": totalQuantityArr?.find(k => k.purchaseOrderId == e.purchaseOrderId)?.dataValues?.totalProductQty || 0
      }
    })

    return PaginatedData(result, limit, page)

  } catch (error) {
    console.error(`Error in getting purchase Order for search term '${data.search || "N/A"}':`, error.message);
    throw error;
  }
}

// get latest transaction number
export async function latestTranscationNumber(purchaseOrderId, t) {
  try {
    const result = await model.poSupplierInvoiceMapperModel.findOne({
      attributes: ['transaction'],
      where: {
        purchaseOrderId: purchaseOrderId,
      },
      order: [['created_at', 'DESC']],
      limit: 1,
      ...(t && { transaction: t })
    });
    return result;
  } catch (error) {
    console.error(`Error in getting latest transcation number ${purchaseOrderId}:`, error);
    throw error;
  }
}

// add slap details 

export async function addSlabDetails(data) {
  console.log('data-----------', data);
  try {
    const result = await model.poSlabDetails.create(data);
    return result;
  } catch (error) {
    console.error("Error in add Slab Details:", error);
    throw error;
  }
}

//update Slab details

export async function updateSlabDetails(data) {
  try {
    const result = await model.poSlabDetails.update(data, {
      where: {
        poSlabDetailId: data.poSlabDetailId
      },
    });
    return result;
  } catch (error) {
    console.error("Error in update Slab Details:", error);
    throw error;
  }
}


// get latest transcation number

export async function latestSlapSerialNumber(poSupplierInvoiceMapperId) {
  try {
    const result = await model.poSlabDetails.findOne({
      attributes: ['serialNumber'],
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
      },
      order: [['created_at', 'DESC']],
      limit: 1,
    });
    return result;
  } catch (error) {
    console.error(`Error in getting latest Slab Serial Number ${poSupplierInvoiceMapperId}:`, error);
    throw error;
  }
}

// update invoice mapper false to true

export async function updateReceivingInventory(poSupplierInvoiceMapperId) {

  try {
    const poSupplierInvoiceMapperRecord = await model.poSupplierInvoiceMapperModel.findOne({
      where: { poSupplierInvoiceMappperId: poSupplierInvoiceMapperId }
    });

    // If no record found, throw an error
    if (!poSupplierInvoiceMapperRecord) {
      throw new Error('Record with the provided ID not found');
    }
    poSupplierInvoiceMapperRecord.receivingInventory = true;
    const result = await poSupplierInvoiceMapperRecord.save();
    return result;
  } catch (error) {
    console.error("Error occurred while updating receiving inventory:", error);
    throw error;
  }
};

// add payment 

export async function addPayment(data) {
  try {
    const result = await model.purchasePaymentModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add paymentr:", error);
    throw error;
  }
};

// get Payment Details

export async function getPaymentDetails(poSupplierInvoiceMapperId) {
  try {
    const result = await model.accountTransactionModel.findAll({
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        stage: {
          [Op.in]: ['payment'],
        },
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in getting payment details for poSupplierInvoiceMapperId: ${poSupplierInvoiceMapperId}`, error);
    throw error;
  }
};

// add container 

export async function addContainer(data) {
  try {
    const result = await model.containerModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add container:", error);
    throw error;
  }
};

// get Payment Details

export async function getContainerDetails(poSupplierInvoiceMapperId) {
  try {
    console.log('Fetching container details for poSupplierInvoiceMapperId:', poSupplierInvoiceMapperId.poSupplierInvoiceMappperId);
    const result = await model.containerModel.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId.poSupplierInvoiceMappperId
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in getting container details for poSupplierInvoiceMapperId: ${poSupplierInvoiceMapperId}`, error);
    throw error;
  }
};


export async function purchaseAccountTransaction(data, transaction) {
  try {
    const result = await model.accountTransactionModel.create(data, {transaction});
    return result;
  } catch (error) {
    console.error("Error in add paymentr:", error);
    throw error;
  }
};

export async function balanceDebitEntriesForPurchaseOrder(poSupplierInvoiceMapperId, accountsId) {

  try {
    const result = await model.accountTransactionModel.findAll({
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        transactionAmountType: 'debit',
        stage: {
          [Op.in]: ['purchase', 'freightBill']
        }
      }
    });

    const newEntries = result.map(entry => {
      const entryData = entry.toJSON();

      delete entryData.accountTransactionId;

      return {
        ...entryData,
        transactionAmountType: 'credit',
        stage: 'inventory',
        entryType: 'cr',
        // accountsId:accountsId
      };
    });
    await model.accountTransactionModel.bulkCreate(newEntries);
    console.log('New credit entries with poslab stage have been created.');

    return result;
  } catch (error) {
    console.error("Error in getting and creating debit entries:", error);
    throw error;
  }
};


export async function inventoryInverance(poSupplierInvoiceMapperId) {
  try {
    const inventoryTotal = await model.accountTransactionModel.sum('transactionAmount', {
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        stage: 'inventory',
      }
    });

    const poslabTotal = await model.accountTransactionModel.sum('transactionAmount', {
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        stage: 'poslab',
      }
    });

    const inventoryEntries = await model.accountTransactionModel.findOne({
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        stage: 'inventory',
      }
    });

    const variance = inventoryTotal - poslabTotal;
    const type = variance > 0 ? 'debit' : 'credit';
    const entryType = variance > 0 ? 'dr' : 'cr';

    return {
      inventoryTotal,
      poslabTotal,
      variance,
      type,
      entryType,
      inventoryEntries
    };

  } catch (error) {
    console.error("Error in calculating inventory and poslab totals:", error);
    throw error;
  }
};

export async function balanceDebitEntriesForPurchaseOrderOnPayment(poSupplierInvoiceMapperId) {
  try {
    const result = await model.accountTransactionModel.findAll({
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        transactionAmountType: 'credit',
        stage: {
          [Op.in]: ['purchase']
        }
      }
    });

    const results = await model.accountTransactionModel.findAll({
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
        accountsId: 105
      }
    });

    if (!result || result.length === 0) {
      console.log('No credit entries found for the given PO.');
      return;
    }

    const newEntries = result.map(entry => {
      const entryData = entry.toJSON();
      delete entryData.accountTransactionId;

      return {
        ...entryData,
        transactionAmountType: 'debit',
        stage: 'payment',
        entryType: 'dr',
      };
    });

    await model.accountTransactionModel.bulkCreate(newEntries);
    console.log('New debit entries for result have been created for the payment stage.');

    const newResultsEntries = results.map(entry => {
      const entryData = entry.toJSON();
      delete entryData.accountTransactionId;

      return {
        ...entryData,
        transactionAmountType: 'debit',
        stage: 'payment',
        entryType: 'dr',
      };
    });

    await model.accountTransactionModel.bulkCreate(newResultsEntries);
    console.log('New debit entries for results have been created for the payment stage.');

    return {
      result: result,
      results: newResultsEntries,
      newEntries: newEntries
    };

  } catch (error) {
    console.error("Error in getting and creating debit entries:", error);
    throw error;
  }
};


export async function getCOATransactionDetails(queryParams = {}) {
  try {
    const result = await model.accountsModel.findAll({
      attributes: ['accountName', 'accountsId', 'accountBalance', 'coaCode'],
      include: [
        {
          model: model.accountTransactionModel,
          attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod', 'createdAt'],
          where: {
            ...(queryParams.customerId && { customerId: queryParams.customerId }),
            ...(queryParams.supplierId && { supplierId: queryParams.supplierId }),
            ...(queryParams.poSupplierInvoiceMapperId && { poSupplierInvoiceMapperId: queryParams.poSupplierInvoiceMapperId }),
            ...(queryParams.purchaseOrderId && { purchaseOrderId: queryParams.purchaseOrderIds }),
            ...(queryParams.soLoadingOrderId && { soLoadingOrderId: queryParams.soLoadingOrderId }),
            ...(queryParams.so && { so: queryParams.so }),
            ...(queryParams.accountsId && { accountsId: queryParams.accountsId }),

          },
          include: [{
            model: model.poSupplierInvoiceMapperModel,
            attributes: ['poSupplierInvoiceMappperId', 'purchaseOrderId', 'totalProductCharges', 'invoice', 'invoiceDate', 'shipDate', 'dueDate'],
            as: 'poSupplierInvoice'
          },
          {
            model: model.purchaseModel,
            attributes: ['purchaseOrderId', 'poDate', 'supplierSo', 'locationId', 'purchaseLocationId', 'etaDate', 'supplier_id'],
            as: 'purchaseOrder',
            include: [
              {
                model: model.supplierModel,
                as: 'suppliers',
                attributes: ['supplierName', 'supplierId']

              }
            ]
          },
          {
            model: model.soLoadingOrderModel,
            as: 'soLoadingOrders',
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
            include: [
              {
                model: model.salesOrderModel,
                attributes: ['salesOrdersId', 'customerId', 'location'],
                include: [
                  {
                    model: model.customerModel,
                    as: 'customers', attributes: ['customerId', 'customerName']
                  }
                ]
              }
            ]
          }
          ]
        },
      ],
    });;
    return result;
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    throw new Error('Failed to fetch transaction data');
  }
}


//delete prepurchase orderproduct


export async function deletePrePurchaeProduct(purchaseOrderProductId) {
  try {
    const result = await model.purchaseProductModel.destroy({
      where: {
        purchaseOrderProductId: purchaseOrderProductId
      }
    });
    return result;
  } catch (error) {
    console.error("Error in fetching pre-purchase product details:", error);
    throw error;
  }
}




export async function getSupplierInvoices(data) {

  try {
    const result = await model.poSupplierInvoiceMapperModel.findAll({

      include: [
        {
          model: model.locationModel,
          as: "shipLocation"
        },
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: data.clientId
          }
        },
        {
          model: model.purchaseModel,
          attributes: ['paymentTerm', 'purchaseLocationId', 'locationId', 'supplierSo', 'container', 'requiredShipDate'],
          include: [
            {
              model: model.supplierModel,
              as: 'suppliers',
              attributes: ['supplierName', 'supplierId'],

              where: data.supplierId ? { supplierId: data.supplierId } : undefined,
            },
            {
              model: model.vendorModel,
              attributes: ['vendorName', 'vendorId'],
            },
            {
              model: model.locationModel,
              as: 'location'
            }
          ]
        },
        {
          model: model.accountTransactionModel,
          as: 'poSupplierInvoice',
          attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'transactionOf', 'transactionAmount', 'transactionAmountType', 'amount', 'supplierId'],
          // where: {
          //   ...(data.supplierId && { supplierId: data.supplierId })
          // }
        }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error in add supplier Invoice:", error);
    throw error;
  }
}


export async function addToCart(data) {
  try {
    const result = await model.AddToCart.create(data);
    return result;
  } catch (error) {
    console.error("Error in create order:", error);
    throw error;
  }
}


export async function deleteCartItem(data) {
  try {
    const cartIds = Array.isArray(data.cartId) ? data.cartId : [data.cartId];
    const result = await model.AddToCart.destroy({
      where: {
        cartId: cartIds,
      },
    });

    if (result === 0) {
      throw new Error("No cart items found for the specified cart IDs.");
    }

    return { message: "Cart item(s) deleted successfully", deletedCount: result };
  } catch (error) {
    console.error("Error in delete cart item:", error);
    throw new Error("Failed to delete cart item(s). Please try again.");
  }
}


export async function getCartItems(data, createdBy) {
  try {
    const result = await model.AddToCart.findAndCountAll({
      where: {
        createdBy: createdBy
      },
      include: [
        {
          model: model.poSlabDetails
        }
      ]
    });
    return {
      count: result.count,
      items: result.rows
    };
  } catch (error) {
    console.error("Error in retrieving cart items:", error);
    throw error;
  }
}



export async function getSuppliersPOJournal(info) {
  try {
    const result = await model.supplierModel.findAll({
      attributes: ['supplierId', 'supplierName', 'parentLocation'],
      include: [
        {
          model: model.accountTransactionModel,
          attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'supplierId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountType', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod', 'createdAt'],
          as: 'supplierTransactions',
          where: {
            poSupplierInvoiceMapperId: info.poSupplierInvoiceMapperId
          },
          required: true,
          include: [
            {
              model: model.accountsModel
            },
            {
              model: model.poSupplierInvoiceMapperModel,
              attributes: ['poSupplierInvoiceMappperId', 'transaction', 'purchaseOrderId', 'totalProductCharges', 'invoice', 'invoiceDate', 'shipDate', 'dueDate'],
              as: 'poSupplierInvoice',
            },
            {
              model: model.purchaseModel,
              attributes: ['purchaseOrderId', 'poDate', 'supplierSo', 'locationId', 'purchaseLocationId', 'etaDate', 'supplier_id'],
              as: 'purchaseOrder'
            }
          ]
        }
      ]
    });

    return result;
  } catch (error) {
    console.error("Error fetching purchase transactions:", error);
    throw new Error('Failed to fetch purchase transactions');
  }
}


export async function slabLocationTransfer(data) {
  try {
    const result = await model.inventoryTransfterModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create inventory transfer:", error);
    throw error;
  }
}



export async function siplTransactionStatusUpdate(data) {
  try {
    const result = await model.poSupplierInvoiceMapperModel.update(data, {
      where: {
        poSupplierInvoiceMappperId: data.poSupplierInvoiceMappperId
      },
    });
    return result;
  } catch (error) {
    console.error("Error in SIPL Status update:", error);
    throw error;
  }
}



export async function createProductLandedCost(data) {
  try {
    const result = await model.landedCostModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in SIPL Status update:", error);
    throw error;
  }
}

export async function findCartById(cartId) {
  try {
    const result = await model.AddToCart.findOne({
      attributes: ['poSlabDetailId'],
      where: {
        cartId: cartId,
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in ${cartId}:`, error);
    throw error;
  }
}

export async function getSlabInfo(poSlabDetailId) {
  try {
    const result = await model.poSlabDetails.findOne({
      where: { poSlabDetailId },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy", "po_supplier_invoice_id", "po_supplier_invoice_mapper_id", "po_slab_detail_id", "location_id"] },
      include: [
        {
          model: model.poSupplierInvoiceModel,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy", "po_supplier_invoice_mapper_id", "purchase_order_product_id"] },
          include: [
            {
              model: model.productModel,
              as: 'supplierInvoices',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy",] },
              include: [
                {
                  model: model.landedCostModel,
                  as: 'productLandeCost',
                  attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy",] },
                }
              ]
            },
            {
              model: model.poSupplierInvoiceMapperModel,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy",] },
              include: [
                {
                  model: model.purchaseModel,
                  attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy",] },
                  include: [
                    {
                      model: model.supplierModel,
                      as: "suppliers",
                      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', "createdBy", "updatedBy",] },
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: model.locationModel,
          attributes: ["location"],
        }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error in getting PO slab Detail:", error);
    throw error;
  }
}

// Cancel purchase order.
export async function cancelPurchaseOrder(id) {
  try {
    const result = await model.purchaseModel.update({ status: purchaseStatus[3] }, {
      where: {
        purchaseOrderId: id
      }
    });

    return result;
  } catch (error) {
    console.error("Error in cancelling PO:", error);
    throw error;
  }
}

export async function getSupplierInvoiceByPoSupplierInvoiceId(poSupplierInvoiceId) {
  try {
    const result = await model.poSupplierInvoiceModel.findAll({
      attributes: ["unitPrice"],
      where: {
        poSupplierInvoiceId: poSupplierInvoiceId
      },
      include: [
        {
          model: model.purchaseProductModel,
          as: 'supplierPurchaseProduct',
          attributes: ['purchaseOrderId']
        }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error in getting supplierinvoice:", error);
    throw error;
  }
};

//updateSlabStatus
export async function updateSlabStatus(poSimId) {
  try {
    await poSlabDetailModel.update(
      { status: 'ACTIVE' },
      {
        where: {
          poSupplierInvoiceMapperId: poSimId
        }
      }
    )
  } catch (error) {
    console.error('Error While Uopdating Slab Status', error);
    throw error
  }
}

export async function isContainerExist(poSupplierInvoiceMappperId) {
  try {
    const result = await model.poSupplierInvoiceMapperModel.findOne({ where: { poSupplierInvoiceMappperId } });
    return result?.dataValues?.container ? true : false;
  } catch (error) {
    console.error("Error while Fetching Container in SIPL:", error);
    throw error;
  }
}

export async function updateSlabStatusOnContainer(poSupplierInvoiceMapperId) {
  try {
    poSlabDetailModel.update(
      { status: 'INTRANSIT' },
      {
        where: {
          poSupplierInvoiceMapperId
        }
      }
    )
  } catch (error) {
    console.error("Error while Fetching Container in SIPL:", error);
    throw error;
  }
}


export function addInvoice(data, createdBy) {
  const { invoiceData, productDetail, otherCharges } = data
  const totalProductCharges = productDetail.reduce((sum, data) => (sum + parseFloat(data.qty) * parseFloat(data.unitPrice)), 0)
  const otherChargesTotal = parseFloat(otherCharges?.amount)
  const finalTotalCharges = totalProductCharges + otherChargesTotal
  const totalProductQuantity = productDetail.reduce((sum, data) => (sum + parseFloat(data.qty)), 0)

  try {
    // const result = await model.poSupplierInvoiceMapperModel.create({
    //   ...invoiceData,
    //   totalProductCharges,
    //   otherChargesTotal,
    //   finalTotalCharges,
    //   totalProductQuantity,
    //   createdBy
    // });

    return 0;
  } catch (error) {
    console.error("Error while Adding Purchase Invoice", error);
    throw error;
  }
}