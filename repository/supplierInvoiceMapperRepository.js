
import * as model from "../models/index.js";
import { Op, Sequelize } from "sequelize";

export async function getSlabDetailByInvoiceMapper(poSupplierInvoiceMappperId) {
    try {
        // Build the base query
        const query = {
            include: [
                {
                    model: model.poSupplierInvoiceModel,
                    as: 'supplierInvoice',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                    include: [
                        {
                            model: model.poSlabDetails,
                            as: 'slabDetails',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                        },
                        {
                            model: model.productModel,
                            as: 'supplierInvoices',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
                        },
                    ]
                }
            ],
            where: {
                poSupplierInvoiceMappperId
            }
        };

        // Dynamically add the accountTransactionModel to the include array if needed
        const transactionExists = await model.accountTransactionModel.count({
            where: {
                poSupplierInvoiceMapperId: poSupplierInvoiceMappperId,
                transactionAmountType: 'credit',
                entryType: 'dr'
            }
        });

        if (transactionExists > 0) {
            query.include.push({
                model: model.accountTransactionModel,
                as: 'poSupplierInvoice',
                attributes: [
                    'po_supplier_invoice_mapper_id',
                    // [Sequelize.fn('SUM', Sequelize.col('transaction_amount')), 'totalTransactionAmount'],
                ],
                where: {
                    poSupplierInvoiceMapperId: poSupplierInvoiceMappperId,
                    transactionAmountType: 'credit',
                    entryType: 'dr'
                },
                group: ['po_supplier_invoice_mapper_id'],
                raw: true,
            });
        }

        // Fetch the result
        const res = await model.poSupplierInvoiceMapperModel.findOne(query);
        return res;
    } catch (error) {
        throw new Error(`Failed to fetch slab details: ${error.message}`);
    }
}
