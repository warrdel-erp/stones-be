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

export async function getOpenPo(fromDate, toDate){
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.purchaseModel.findAll({
        where: {
                status: 'Open',
                po_date: {
                    [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
                }
            }
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

export async function getOpenSo(fromDate, toDate){
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

export async function soNotes(fromDate, toDate){
    const attributes = ['so','soDate','internalNotes','printedNotes'];
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.salesOrderModel.findAll({
        attributes:attributes,
        where: {
            created_at: {
                    [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
                }
            }
    });
    return result
};

export async function poNotes(fromDate, toDate){
    const attributes = ['po','poDate','notes'];
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);
    const result = await model.purchaseModel.findAll({
        attributes:attributes,
        where: {
            created_at: {
                    [Op.between]: [new Date(fromDate).toISOString(), endDate.toISOString()]
                }
            }
    });
    return result
};