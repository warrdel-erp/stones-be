import * as model from "../models/index.js";
import { Op } from "sequelize";

export async function createOrder(data) {
  try {
    const result = await model.purchaseModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create order:", error);
    throw error;
  }
}

export async function latestPoNumber() {
  try {
    const attributes = ['po'];
    const result = await model.purchaseModel.findOne({
      attributes: attributes,
      order: [['created_at', 'DESC']],
      limit: 1,
    });
    return result;
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

export async function findPoNumber(poNumber) {
  const result = await model.purchaseModel.findOne({
    where: {
      po: {
        [Op.eq]: poNumber
      }
    }
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
getPrePurchaseOrder();

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

export async function getSinglePurchaseOrder(poNumber) {
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
        po: poNumber
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in getting purchase order Id :-${poNumber}:`, error);
    throw error;
  }
}

//get all purchase Order

export async function getAllPurchaseOrder(searchText) {
  let result;
  try {
    if (searchText) {
      result = await model.purchaseModel.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        where: {
          po: {
            [Op.like]: `%${searchText}%`
          }
        },
        include: [
          {
            model: model.supplierModel,
            as: 'suppliers',
            where: {
              supplier_name: {
                [Op.like]: `%${searchText}%`
              }
            }
          },
          {
            model: model.locationModel,
            as: 'location',
            where: {
              location: {
                [Op.like]: `%${searchText}%`
              }
            }
          },
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      result = await model.purchaseModel.findAll({
        attributes: ['po', 'poDate', 'requiredShipDate', 'supplierSo', 'container', 'paymentTerm', 'status', 'purchaseLocationId'],
        include: [
          {
            model: model.supplierModel,
            as: 'suppliers',
            attributes: ['supplierType', 'paymentTerm']
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
      attributes: ['accountName', 'accountsId', 'accountBalance','coaCode'],
      include: [
        {
          model: model.accountTransactionModel,
          attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod'],
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