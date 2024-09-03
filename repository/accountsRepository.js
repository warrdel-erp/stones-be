import * as model from '../models/index.js';
import { Op } from "sequelize";

export async function addAccount(data) {
    try {
        const result = await model.accountsModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in add Account:", error);
        throw error;
    }
};

// get all account type and account sub type

export async function getAllTypeSubTypes() {
    try {
        const result = await model.accountTypesModel.findAll({
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status", "accountTypesId"] },
            include: [
                {
                    model: model.subAccountTypesModel,
                    as: "accountTypeSubtype",
                    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                },
            ],
        });
        return result;
    } catch (error) {
        console.error("Error in get account details:", error);
        throw error;
    }
};

//get all account details

export async function getAllAccounts(searchText) {
    try {
        let result;
        if (searchText) {
            result = await model.accountsModel.findAll({
                attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                where: {
                    accountName: { [Op.like]: `%${searchText}%` },
                },
                include: [
                    {
                        model: model.subAccountTypesModel,
                        as: "accountSubtype",
                        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        //   where: {
                        //     subAccountType: { [Op.like]: `%${searchText}%` },
                        //   },
                        include: {
                            model: model.accountTypesModel,
                            as: "accountTypes",
                            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                            // where: {
                            //     accountType: { [Op.like]: `%${searchText}%` },
                            // },
                        },
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
        } else {
            result = await model.accountsModel.findAll({
                attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                include: [
                    {
                        model: model.subAccountTypesModel,
                        as: "accountSubtype",
                        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        include: {
                            model: model.accountTypesModel,
                            as: "accountTypes",
                            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        },
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting account details ${searchText}:`, error);
        throw error;
    }
};

export async function updateAccount(accountsId, data) {
    try {
        const result = await model.accountsModel.update(data, {
            where: {
                accountsId: accountsId
            }
        });
        return result;
    } catch (error) {
        console.error(`Error updating account ${accountsId} :`, error);
        throw error;
    }
}

export async function deleteAccount(accountsId) {
    try {
        const result = await model.accountsModel.destroy({
            where: { accountsId },
            individualHooks: true
        });
        return { message: 'Account deleted successfully' };
    } catch (error) {
        console.error('Error during soft delete:', error);
        throw new Error('Unable to soft delete account');
    }
};

export async function findAccountNumber(accountId) {
    const result = await model.accountsModel.findOne({
        where: {
            accountsId: {
                [Op.eq]: accountId
            }
        }
    })
    return result;
};





export async function getCashFinancialAssestOptions() {
    const result = await model.subAccountTypesModel.findAll({
        where: {
            subAccountType: 'Cash and Financial Assets',
        },
        attributes: ['subAccountType', 'subAccountTypesId', 'accountTypesId'],
        include: [
            {
                model: model.accountsModel,
                as: 'accountSubtype',
                attributes: ['accountsId', 'subAccountTypesId', 'accountName', 'accountTypesId', 'accountBalance']
            }
        ]
    })
    return result;
};

export async function getGroupedAccountList() {
    const result = await model.subAccountTypesModel.findAll({
        attributes: ['subAccountType', 'subAccountTypesId', 'accountTypesId'],
        include: [
            {
                model: model.accountsModel,
                as: 'accountSubtype',
                attributes: ['accountsId', 'subAccountTypesId', 'accountName', 'accountTypesId', 'accountBalance'],
            },
            {
                model: model.accountTypesModel,
                as: 'accountTypeSubtype',
                attributes: ['accountType', 'accountTypesId']
            }
        ]
    })
    return result;
};



export async function getAccountIdByAccountName(data) {
    const { creditAccountName, debitAccountName } = data;
    console.log(data, 'accnames');

    try {
        const result = await model.accountsModel.findAll({
            where: {
                accountName: {
                    [Op.in]: [creditAccountName, debitAccountName]
                }
            },
            attributes: ['accountsId', 'accountName']
        });

        const accountDetails = result.reduce((acc, account) => {
            if (account.accountName === creditAccountName) {
                acc.creditAccount = {
                    accountId: account.accountsId,
                    accountName: account.accountName
                };
            } else if (account.accountName === debitAccountName) {
                acc.debitAccount = {
                    accountId: account.accountsId,
                    accountName: account.accountName
                };
            }
            return acc;
        }, {});

        return accountDetails;

    } catch (error) {
        console.error('Error fetching account IDs:', error);
        throw new Error('Unable to fetch account IDs');
    }
}

//get coa account details
// export async function getCOATransactionDetails(queryParams = {}) {
//     try {

//         const { month, year } = queryParams;
//         let startDate, endDate;


//         if (month && year) {
//             startDate = new Date(year, month - 1, 1);
//             endDate = new Date(year, month, 0);
//         }
//         console.log(queryParams, 'datess');

//         const result = await model.accountsModel.findAll({
//             attributes: ['accountName', 'accountsId', 'accountBalance', 'coaCode'],
//             include: [
//                 {
//                     model: model.accountTransactionModel,
//                     attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod', 'createdAt'],
//                     where: {
//                         ...(queryParams.customerId && { customerId: queryParams.customerId }),
//                         ...(queryParams.supplierId && { supplierId: queryParams.supplierId }),
//                         ...(queryParams.poSupplierInvoiceMapperId && { poSupplierInvoiceMapperId: queryParams.poSupplierInvoiceMapperId }),
//                         ...(queryParams.purchaseOrderId && { purchaseOrderId: queryParams.purchaseOrderIds }),
//                         ...(queryParams.soLoadingOrderId && { soLoadingOrderId: queryParams.soLoadingOrderId }),
//                         ...(queryParams.so && { so: queryParams.so }),
//                         ...(queryParams.accountsId && { accountsId: queryParams.accountsId }),
//                         ...(startDate && endDate && {
//                             createdAt: {
//                                 [Op.between]: [startDate, endDate]
//                             }
//                         }),
//                     },
//                     include: [
//                         {
//                             model: model.poSupplierInvoiceMapperModel,
//                             attributes: ['poSupplierInvoiceMappperId', 'transaction', 'purchaseOrderId', 'totalProductCharges', 'invoice', 'invoiceDate', 'shipDate', 'dueDate'],
//                             as: 'poSupplierInvoice'
//                         },
//                         {
//                             model: model.purchaseModel,
//                             attributes: ['purchaseOrderId', 'poDate', 'supplierSo', 'locationId', 'purchaseLocationId', 'etaDate', 'supplier_id'],
//                             as: 'purchaseOrder',
//                             include: [
//                                 {
//                                     model: model.supplierModel,
//                                     as: 'suppliers',
//                                     attributes: ['supplierName', 'supplierId']

//                                 }
//                             ]
//                         },
//                         {
//                             model: model.soLoadingOrderModel,
//                             as: 'soLoadingOrders',
//                             attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
//                             include: [
//                                 {
//                                     model: model.salesOrderModel,
//                                     attributes: ['salesOrdersId', 'customerId', 'location'],
//                                     include: [
//                                         {
//                                             model: model.customerModel,
//                                             as: 'customers', attributes: ['customerId', 'customerName']
//                                         }
//                                     ]
//                                 }
//                             ]
//                         },
//                         {
//                             model: model.clientUserModel,
//                             as: 'clientDetails',
//                             attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
//                             where: {
//                                 clientId: queryParams.clientId
//                             },
//                         }
//                     ]
//                 },
//             ],
//         });;
//         return result;
//     } catch (error) {
//         console.error("Error fetching transaction data:", error);
//         throw new Error('Failed to fetch transaction data');
//     }
// }



export async function getCOATransactionDetails(queryParams = {}) {
    try {

        const { month, year } = queryParams;
        let startDate, endDate;


        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
        }
        console.log(queryParams, 'datess');
        const result = await model.subAccountTypesModel.findAll({
            attributes:['subAccountType','subAccountTypesId'],
            include: [
                {
                    model: model.accountsModel,
                    attributes: ['accountName', 'accountsId', 'accountBalance', 'coaCode'],
                    as: 'accountSubtype',
                    required:true,
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
                                ...(startDate && endDate && {
                                    createdAt: {
                                        [Op.between]: [startDate, endDate]
                                    }
                                }),
                            },
                            include: [
                                {
                                    model: model.poSupplierInvoiceMapperModel,
                                    attributes: ['poSupplierInvoiceMappperId', 'transaction', 'purchaseOrderId', 'totalProductCharges', 'invoice', 'invoiceDate', 'shipDate', 'dueDate'],
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
                                            attributes: ['salesOrdersId', 'customerId', 'location','so'],
                                            include: [
                                                {
                                                    model: model.customerModel,
                                                    as: 'customers', attributes: ['customerId', 'customerName']
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    model: model.clientUserModel,
                                    as: 'clientDetails',
                                    attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                                    where: {
                                        clientId: queryParams.clientId
                                    },
                                }
                            ]
                        },
                    ]
                }
            ]
        })
        return result;
    } catch (error) {
        console.error("Error fetching transaction data:", error);
        throw new Error('Failed to fetch transaction data');
    }
}

//get transaction history based on supplier 

export async function getPurchaseTransactions(supplierId, limit, offset, clientId) {
    try {
        const result = await model.supplierModel.findAll({
            attributes: ['supplierId', 'supplierName'],
            where: {
                ...(supplierId && { supplierId })
            },
            // limit: limit,
            // offset: offset,
            include: [
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                    where: {
                        clientId: clientId
                    },
                },
                {
                    model: model.accountTransactionModel,
                    attributes: ['accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId', 'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountType', 'transactionAmountDate', 'transactionAmountType', 'accountsId', 'entryType', 'paymentMethod', 'createdAt'],
                    as: 'supplierTransactions',
                    required: true,
                    include: [
                        {
                            model: model.accountsModel
                        },
                        {
                            model: model.poSupplierInvoiceMapperModel,
                            attributes: ['poSupplierInvoiceMappperId', 'transaction', 'purchaseOrderId', 'totalProductCharges', 'invoice', 'invoiceDate', 'shipDate', 'dueDate'],
                            as: 'poSupplierInvoice'
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


//get transaction history based on customers

export async function getSalesTransactions(customerId, limit, offset, clientId) {
    try {
        const result = await model.customerModel.findAll({
            attributes: ['customerId', 'customerName'],
            where: {
                ...(customerId && { customerId })
            },
            // limit: limit,
            // offset: offset,
            include: [
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                    where: {
                        clientId: clientId
                    },
                },
                {
                    model: model.accountTransactionModel,
                    attributes: [
                        'accountTransactionId', 'poSupplierInvoiceMapperId', 'purchaseOrderId',
                        'soLoadingOrderId', 'so', 'transactionOf', 'transactionAmount', 'transactionAmountType',
                        'transactionAmountDate', 'transactionAmountType', 'accountsId',
                        'entryType', 'paymentMethod', 'createdAt'
                    ],
                    as: 'customerTransactions',
                    required: true,
                    include: [
                        {
                            model: model.accountsModel
                        },
                        {
                            model: model.soLoadingOrderModel,
                            as: 'soLoadingOrders',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            include: [
                                {
                                    model: model.salesOrderModel,
                                    attributes: ['salesOrdersId', 'customerId', 'location'],
                                }
                            ]
                        },

                    ],
                }
            ],
        });

        return result;
    } catch (error) {
        console.error("Error fetching sales transactions:", error);
        throw new Error('Failed to fetch sales transactions');
    }
}

