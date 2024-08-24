import { lowStockQuantity } from '../constant.js';
import * as model from '../models/index.js';
import { Op } from "sequelize";

export async function getTotalPurchase(fromDate, toDate) {
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.poSupplierInvoiceMapperModel.findAll({
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        }
    });
    const totalFinalCharges = result.reduce((sum, entry) => sum + entry.dataValues.finalTotalCharges, 0);
    return totalFinalCharges;
};

export async function getOpenPo(fromDate, toDate, clientId) {
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.purchaseModel.findAll({
        where: {
            status: 'Open',
            po_date: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        },
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
    return result.length
};

export async function getTotalsales(fromDate, toDate) {
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.soLoadingOrderModel.findAll({
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        }
    });
    const totalFinalCharges = result.reduce((sum, entry) => sum + entry.dataValues.total, 0);
    return totalFinalCharges;
};

export async function getOpenSo(fromDate, toDate) {
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.salesOrderInventoryModel.findAll({
        where: {
            sales_status: 'INITIATED',
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        }
    });
    return result.length
};

export async function soNotes(fromDate, toDate, clientId) {
    const attributes = ['so', 'soDate', 'internalNotes', 'printedNotes'];
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.salesOrderModel.findAll({
        attributes: attributes,
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        },
        include: [
            {
                model: model.clientUserModel,
                as: 'clientDetails',
                attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                where: {
                    clientId: clientId
                },
            },
        ]
    });
    return result
};

export async function poNotes(fromDate, toDate, clientId) {
    const attributes = ['po', 'poDate', 'notes'];
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.purchaseModel.findAll({
        attributes: attributes,
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        },
        include: [
            {
                model: model.clientUserModel,
                as: 'clientDetails',
                attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                where: {
                    clientId: clientId
                },
            },
        ]
    });
    return result
};

export async function stockInventory(fromDate, toDate, clientId) {
    const attributes = ['productId', 'slabInStock', 'quantityInStock'];
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.productInventoryModel.findAll({
        attributes: attributes,
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        },
        include: [
            {
                model: model.productModel,
                as: "salesProductDetails",
                attributes: ['productName'],
            },
            {
                model: model.clientUserModel,
                as: 'clientDetails',
                attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                where: {
                    clientId: clientId
                },
            },
        ],
    });
    return result
};


export async function lowStock(fromDate, toDate, clientId) {
    const attributes = ['productId', 'slabInStock', 'quantityInStock'];

    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    const result = await model.productInventoryModel.findAll({
        attributes: attributes,
        where: {
            created_at: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            },
            quantityInStock: {
                [Op.gt]: lowStockQuantity
            }
        },
        include: [
            {
                model: model.productModel,
                as: "salesProductDetails",
                attributes: ['productName'],
            },
            {
                model: model.clientUserModel,
                as: 'clientDetails',
                attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                where: {
                    clientId: clientId
                },
            },
        ],
    });

    return result;
}

// calender complete month Data

export async function getCalenderMonthData(fromDate, toDate) {
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const attributes = ['po', 'etaDate', 'purchaseOrderId'];
    const result = await model.purchaseModel.findAll({
        attributes: attributes,
        where: {
            eta_date: {
                [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
            }
        }
    });
    return result
};

// single Date Data

export async function getCalenderDateData(date) {
    const targetDate = new Date(date);

    const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

    let result;
    const attributes = ['po', 'poDate', 'etaDate', 'purchaseOrderId'];
    result = await model.purchaseModel.findAll({
        attributes: attributes,
        where: {
            eta_date: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [
            {
                model: model.supplierModel,
                as: "suppliers",
                attributes: ['supplierName'],
            },
            {
                model: model.locationModel,
                as: "location",
                foreignKey: "location_id",
                attributes: ['location'],
            },
            {
                model: model.locationModel,
                as: "purchaseLocation",
                foreignKey: "purchase_location_id",
                attributes: ['location'],
            },
            {
                model: model.purchaseProductModel,
                as: 'purchaseProduct',
                attributes: ['productId'],
                include: [
                    {
                        model: model.productModel,
                        as: 'products',
                        attributes: ['productName']
                    }
                ]
            },
        ]
    });
    return result;
};