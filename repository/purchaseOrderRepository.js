import * as model from "../models/index.js";
import { Op, Sequelize, where } from "sequelize";

export async function createOrder(data) {
  try {
    const result = await model.purchaseModel.create(data);
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
  console.log('Info:', info); // Log the info object
  try {
    // Update the order
    const result = await model.purchaseModel.update(info, {
      where: {
        purchaseOrderId: Number(poNumber)
      }
    });

    console.log('Update result:', result); // Log the result of the update
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
      }
    },
    // include: [
    //   {
    //     model: model.clientUserModel,
    //     as: 'clientDetails',
    //     attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
    //     where: {
    //       clientId: clientId
    //     }
    //   }
    // ]
  })
  return result;
}

export async function createPurchaseProductOrder(data,transaction) {
  try {
    const result = await model.purchaseProductModel.create(data,{
      transaction: transaction
    });
    return result;
  } catch (error) {
    console.error("Error in create purchase product order:", error);
    throw error;
  }
}

export async function addOtherCharges(data,transaction) {
  try {
    if (Array.isArray(data)) {
      //  multiple records 
      const results = await model.productOtherCharges.bulkCreate(data,{
        transaction: transaction
      });
      return results;
      //single
    } else {
      const result = await model.productOtherCharges.create(data,{transaction});
      return result;
    }
  } catch (error) {
    console.error("Error in adding other charges:", error);
    throw new Error("Failed to add other charges. Please try again later.");
  }
}


export async function createPrePurchaseOrder(data,transaction) {
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
    console.log(result, 'kjasdkas');
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
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
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


//get all purchase Order

export async function getAllPurchaseOrder(data) {
  let result;
  try {
    if (data.search) {
      result = await model.purchaseModel.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        where: {
          po: {
            [Op.like]: `%${data.search}%`
          }
        },
        include: [
          {
            model: model.poSupplierInvoiceMapperModel,
            where: {
              purchaseOrderId: {
                [Op.like]: `%${data.search}%`
              }
            }
          },
          {
            model: model.supplierModel,
            as: 'suppliers',
            where: {
              supplier_name: {
                [Op.like]: `%${data.search}%`
              }
            }
          },
          {
            model: model.locationModel,
            as: 'location',
            where: {
              location: {
                [Op.like]: `%${data.search}%`
              }
            }
          },
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      result = await model.purchaseModel.findAll({
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
          [
            Sequelize.literal(
              `(SELECT SUM(transaction_amount) 
                      FROM account_transaction 
                      WHERE account_transaction.purchase_order_id = purchase_orders.purchase_order_id)`
            ),
            'totalTransactionAmount'
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
                as: 'poSupplierInvoice'
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
          }
        ],
        order: [['createdAt', 'DESC']]
      });

    }
    return result;
  } catch (error) {
    console.error(`Error in getting purchase Order for search term '${data.search || "N/A"}':`, error);
    throw error;
  }
}


// get latest transcation number

export async function latestTranscationNumber(purchaseOrderId) {
  try {
    const result = await model.poSupplierInvoiceMapperModel.findOne({
      attributes: ['transaction'],
      where: {
        purchaseOrderId: purchaseOrderId,
      },
      order: [['created_at', 'DESC']],
      limit: 1,
    });
    return result;
  } catch (error) {
    console.error(`Error in getting latest transcation number ${purchaseOrderId}:`, error);
    throw error;
  }
}

// add slap details 

export async function addSlabDetails(data) {
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
        transactionAmountType: 'credit',
        entryType: 'dr'
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


export async function purchaseAccountTransaction(data) {
  try {
    const result = await model.accountTransactionModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add paymentr:", error);
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
  console.log(data, 'jsjsj');

  try {
    const result = await model.poSupplierInvoiceMapperModel.findAll({

      include: [
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
    console.log(result, 'resusllls');

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