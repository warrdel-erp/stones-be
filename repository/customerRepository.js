import * as model from '../models/index.js';
import { Op } from 'sequelize';

export async function addCustomer(data) {
    try {
        const result = await model.customerModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addCustomer:", error);
        throw error;
    }
}

export async function getAllCustomers(data) {
    let result;
    try {
        const attributes = ['customerName', 'customerId', 'primaryPhoneNumber', 'country', 'customerType', 'primaryPhoneNumber', 'accEmail', 'address', 'city', 'state', 'zip', 'pSalesPerson', 'priceLevel', 'sAddress', 'sUnit', 'sCity', 'sState', 'sZip', 'taxExempt', 'salesTax', 'paymentTerms', 'exemptCerti', 'exemptExipry', 'internalNotes', 'deliveryNotes'];
        if (data.search !== 'all') {
            result = await model.customerModel.findAll({
                attributes: attributes,
                where: {
                    customerName: {
                        [Op.like]: `%${data.search}%`
                    }
                },
            });
        } else {
            result = await model.customerModel.findAll({
                attributes: attributes, include: [
                    {
                        model: model.clientUserModel,
                        as: 'clientDetails',
                        attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                        where: {
                            clientId: data.clientId
                        },
                    }
                ],
            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting customer ${data.search}:`, error);
        throw error;
    }
}

export async function getSingleCustomer(customerName) {
    try {
        const result = await model.customerModel.findOne({
            where: {
                customerName: customerName
            },
            include: [
                {
                    model: model.accountTransactionModel,
                    attributes: [
                        'accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId',
                        'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountType',
                        'transactionAmountDate', 'transactionAmountType', 'accountsId',
                        'entryType', 'paymentMethod', 'createdAt'
                    ],
                    as: 'customerTransactions',
                },
                {
                    model: model.salesOrderModel,
                    include: [
                        {
                            model: model.soLoadingOrderModel,
                            as: 'loadingOrders',
                            where: {
                                salesStatus: 'INVOICE'
                            }
                        }
                    ]
                }
            ]
        });
        return result;
    } catch (error) {
        console.error(`Error in getSingleCustomer ${customerName}:`, error);
        throw error;
        return error;
    }
}

export async function getCustomerID() {
    try {
        const attributes = ['customerId'];
        const result = await model.customerModel.findOne({
            attributes: attributes,
            order: [['created_at', 'DESC']],
            limit: 1,
        });
        return result;
    } catch (error) {
        console.log("Error getting customerID: ", error);
        throw error;
    }
}