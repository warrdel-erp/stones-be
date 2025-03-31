import { Transaction } from "sequelize";
import * as models from "../models";
import { SoInvoice } from "../models/salesOrderInvoice.model";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
    return await models.SalesOrderInvoice.create(data, { transaction });
};
