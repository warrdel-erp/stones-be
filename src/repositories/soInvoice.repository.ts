import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { SoInvoice } from "../models/salesOrderInvoice.model";

/**
 * Create a new invoice
 */
export const createInvoice = async (data: SoInvoice, transaction: Transaction) => {
    return await models.SalesOrderInvoice.create(data, { transaction });
};

/**
 * Fetch all invoices
 */
export const getAllInvoices = async (filter: WhereOptions, transaction?: Transaction) => {
    return await models.SalesOrderInvoice.findAll(
        {
            where: filter,
            include: [
                {
                    model: models.Customer,
                    as: "customer",
                    attributes: ["id", "name"],
                }
            ],
            transaction
        }
    );
};