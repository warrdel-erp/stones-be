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
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
      include: [
        {
          model: model.supplierModel,
          as: "suppliers",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
        },
        {
          model: model.locationModel,
          as: "location",
          foreignKey: "location_id",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
        },
        {
          model: model.locationModel,
          as: "purchaseLocation",
          foreignKey: "purchase_location_id",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
        },
        {
          model: model.poSupplierInvoiceMapperModel,
          as: "invoiceMapper",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
          include:[
            {
              model: model.poSupplierInvoiceModel,
              as: "supplierInvoice",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
            },
          ]
        },
        {
          model: model.purchaseProductModel,
          as: "purchaseProduct",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
          include:[
            {
              model: model.productModel,
              as: "products",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
            },
            {
              model: model.prePurchaseModel,
              as: "prePurchase",
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
            },
          ]
        },
      ],
      where:{
        po:poNumber
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
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
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
        attributes: ['po', 'poDate','requiredShipDate','supplierSo','container','paymentTerm','status','purchaseLocationId'],
        include: [
          {
            model: model.supplierModel,
            as: 'suppliers',
            attributes: ['supplierType', 'paymentTerm']
          },
          {
            model: model.locationModel,
            as: 'location',
            attributes: ['location','purchaseLocation']
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