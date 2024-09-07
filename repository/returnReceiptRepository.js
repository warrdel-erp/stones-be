import * as model from "../models/index.js";
import { Op } from "sequelize";

export async function getSalesInvoices(soNumber, clientId, queries = {}) {  
    try {
        const result = await model.salesOrderModel.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            include: [
                {
                    model: model.customerModel,
                    as: "customers",
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                },
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    where: {
                        clientId: clientId
                    },
                },
                {
                    model: model.salesOrderInventoryModel,
                    as: 'salesInventory',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                    include: [
                        {
                            model: model.poSlabDetails,
                            as: 'slabDetails',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            where:{
                                status:'INACTIVE'
                            },
                        },
                        {
                            model: model.productInventoryModel,
                            as: 'salesProduct',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            include: [
                                {
                                    model: model.productModel,
                                    as: 'salesProductDetails',
                                    attributes: ['productName']
                                }
                            ]
                        }
                    ],
                    where: {
                        salesStatus: 'INVOICE',
                        ...(queries.soLoadingOrderId ? { soLoadingOrderId: queries.soLoadingOrderId } : {})
                    },
                },
                {
                    model: model.soLoadingOrderModel,
                    as: 'loadingOrders',
                    attributes: { exclude: ['updatedAt', 'deletedAt', 'status'] },
                    where: {
                        salesStatus: 'INVOICE'
                    },
                },
            ],
        });
        return result;
    } catch (error) {
        console.error(`Error in getting sales order for SO Number ${soNumber}:`, error);
        throw error;
    }
}

export async function updateSlabDetails(poSlabDetailId, status) {
    try {
      const result = await model.poSlabDetails.update(
        { status },
        {
          where: {
            poSlabDetailId
          },
        }
      );
      return result;
    } catch (error) {
      console.error("Error in update Slab Details:", error);
      throw error;
    }
  }
  


  export async function getReturnInvoice(search, clientId,queries) {  
    try {
        console.log(queries.soLoadingOrderId,'skskskk');
        
        const result = await model.salesOrderModel.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
            include: [
                {
                    model: model.customerModel,
                    as: "customers",
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                },
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    where: {
                        clientId:queries.clientId
                    },
                },
                {
                    model: model.salesOrderInventoryModel,
                    as: 'salesInventory',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                    include: [
                        {
                            model: model.poSlabDetails,
                            as: 'slabDetails',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            where:{
                                status:'RETURNED'
                            },
                        },
                        {
                            model: model.productInventoryModel,
                            as: 'salesProduct',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            include: [
                                {
                                    model: model.productModel,
                                    as: 'salesProductDetails',
                                    attributes: ['productName']
                                }
                            ]
                        }
                    ],
                    where: {
                        salesStatus: 'INVOICE',
                        ...(queries.soLoadingOrderId ? { soLoadingOrderId: queries.soLoadingOrderId } : {})
                    },
                },
                {
                    model: model.soLoadingOrderModel,
                    as: 'loadingOrders',
                    attributes: { exclude: ['updatedAt', 'deletedAt', 'status'] },
                    where: {
                        salesStatus: 'INVOICE'
                    },
                },
            ],
        });
        return result;
    } catch (error) {
        console.error(`Error in getting sales order for SO Number:`, error);
        throw error;
    }
}