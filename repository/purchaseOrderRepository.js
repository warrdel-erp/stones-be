import * as model from "../models/index.js";
import { Op, where } from "sequelize";

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

export async function updateOrder(poNumber, data) {
  try {
    const result = await model.purchaseModel.update(data, {
      where: {
        po: poNumber
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
      }
    },
    include: [
      {
        model: model.clientUserModel,
        as: 'clientDetails',
        attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
        where: {
          clientId
        }
      }
    ]
  })
  return result;
}

export async function createPurchaseProductOrder(data) {
  try {
    const result = await model.purchaseProductModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create purchase product order:", error);
    throw error;
  }
}

export async function createPrePurchaseOrder(data) {
  try {
    const result = await model.prePurchaseModel.create(data);
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
    const result = await model.purchaseModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      include: [
        {
          model: model.supplierModel,
          as: "suppliers",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.vendorModel,
          attributes: { include: ['vendorName', 'vendorType', 'vendorId'] },
        },
        {
          model: model.locationModel,
          as: "location",
          foreignKey: "location_id",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.locationModel,
          as: "purchaseLocation",
          foreignKey: "purchase_location_id",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.poSupplierInvoiceMapperModel,
          as: "invoiceMapper",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
          include: [
            {
              model: model.poSupplierInvoiceModel,
              as: "supplierInvoice",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
          ]
        },
        {
          model: model.purchaseProductModel,
          as: "purchaseProduct",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
          include: [
            {
              model: model.productModel,
              as: "products",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
            {
              model: model.prePurchaseModel,
              as: "prePurchase",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            },
          ]
        },
      ],
      where: {
        purchaseOrderId: purchaseOrderId
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in getting purchase order Id :-${purchaseOrderId}:`, error);
    throw error;
  }
}

//get all purchase Order

export async function getAllPurchaseOrder(data) {

  // const fromDate = data.queriedData.fromDate;
  // const toDate = data.queriedData.toDate;

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
        attributes: ['po', 'purchaseOrderId', 'poDate', 'requiredShipDate', 'supplierSo', 'container', 'paymentTerm', 'status', 'purchaseLocationId'],
        // where: {
        //   createdAt: {
        //     [Op.between]: [new Date(fromDate), new Date(toDate)],
        //   },
        // },
        include: [
          {
            model: model.clientUserModel,
            as: 'clientDetails',
            attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
            where: {
              clientId: data.clientId
            },
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
        ],
        order: [['createdAt', 'DESC']]
      });
    }
    return result;
  } catch (error) {
    console.error(`Error in getting purchase Order ${searchText}:`, error);
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
    console.log(`Fetching payment details for poSupplierInvoiceMapperId: ${poSupplierInvoiceMapperId}`);

    const result = await model.purchasePaymentModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId
      },
      include: [{
        model: model.poSupplierInvoiceMapperModel,
        as: "purchaseInvoice",
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      }],
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
    console.log(`Fetching container details for poSupplierInvoiceMapperId: ${poSupplierInvoiceMapperId}`);
    const result = await model.containerModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      where: {
        poSupplierInvoiceMapperId: poSupplierInvoiceMapperId
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
  try {
    const result = await model.poSupplierInvoiceMapperModel.findAll({
      include: [
        {
          model: model.purchaseModel,
          attributes: ['paymentTerm', 'purchaseLocationId', 'locationId', 'supplierSo', 'container', 'requiredShipDate'],
          include: [
            {
              model: model.supplierModel,
              as: 'suppliers',
              attributes: ['supplierName', 'supplierId'],
              where: {
                supplierId: data.supplierId
              }

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
          where: {
            transactionOf: 'purchase',
            supplierId: data.supplierId
          }
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


export async function getCartItems(data) {
  try {
    const result = await model.AddToCart.findAndCountAll({
      where: {
        createdBy: data.createdBy
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
          attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountType', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod', 'createdAt'],
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