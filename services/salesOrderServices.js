import * as salesOrderRepository from '../repository/salesOrderRepository.js';
import moment from 'moment';
import sequelize from '../database/sequelizeConfig.js';
import { updateProductInventoryInactive } from '../repository/productInventoryRespository.js';
import { purchaseAccountTransaction, updateSlabDetails } from '../repository/purchaseOrderRepository.js';
import { getAccountIdByAccountName } from './accountsServices.js';
import { findUserId } from '../repository/clientUserRepository.js';

export async function createOrder(info) {
    return await salesOrderRepository.createOrder(info)
}

export async function getSoNumber(clientId) {
    const result = await salesOrderRepository.latestPoNumber(clientId)
    const newSo = result + 1;
    const todayDate = moment().format('YYYY-MM-DD');
    return { newSo, todayDate };
}

// single so complete details  page

export async function singleSoDetails(soNumber) {
    try {
        const allDetailsPurchaseOrderId = await salesOrderRepository.getSingleSalesOrder(soNumber);
        return allDetailsPurchaseOrderId;
    } catch (error) {
        throw new Error(`Failed to fetch sales ${soNumber} order details: ${error.message}`);
    }
}

export async function addProduct(info) {
    const transaction = await sequelize.transaction();
    try {

        let results = [];

        const salesOrderId = info.salesOrdersId;

        for (const inventory of info.selectedInventory) {
            let { subTotal } = inventory;
            let total = subTotal;
            let tax = 0;

            if (inventory.isTax) {
                const salesTax = await salesOrderRepository.getsalestax(salesOrderId, { transaction });
                const taxPercentage = parseFloat(salesTax) / 100;
                tax = subTotal * taxPercentage;
                total += tax;
            }

            const data = { subTotal, total, tax };
            await salesOrderRepository.updateOrder(salesOrderId, data, { transaction });
        }


        // Loop through inventories and slabs to add products
        for (const inventory of info.selectedInventory) {

            let tax = 0;

            if (inventory.isTax) {
                const salesTax = await salesOrderRepository.getsalestax(salesOrderId, { transaction });
                tax = parseFloat(salesTax);
            }

            for (const slab of inventory.selectedSlabs) {
                const productData = {
                    salesOrdersId: info.salesOrdersId,
                    productInventoryId: inventory.productInventoryId,
                    poSlabDetailId: slab.poSlabDetailId,
                    unitPrice: inventory.unitPrice,
                    tax,
                };
                const result = await salesOrderRepository.addProduct(productData, { transaction });
                results.push(result);
            }
        }

        // Commit the transaction if all operations succeed
        await transaction.commit();
        return { success: true, message: 'Products added successfully', results };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error adding products:', error);
        return { success: false, error: error.message };
    }
};


export async function loadingOrder(info) {
    const transaction = await sequelize.transaction();
    try {
        let soLoadingOrderId, updateResults = [];
        let totalSubTotal = 0;
        let totalTax = 0;
        let totalAmount = 0;

        // Loop through inventories 
        for (const inventory of info.selectedInventory) {
            let tax = 0;
            let total = 0;

            if (inventory.isTax) {
                const salesTax = await salesOrderRepository.getsalestax(info.salesOrdersId, { transaction });
                const taxPercentage = parseFloat(salesTax) / 100;
                tax = inventory.subTotal * taxPercentage;
                total = inventory.subTotal + tax;
            } else {
                tax = 0;
                total = inventory.subTotal;
            }
            totalSubTotal += inventory.subTotal;
            totalTax += tax;
            totalAmount += total;
        };

        // Create a single loading order 
        const data = {
            subTotal: totalSubTotal,
            total: totalAmount,
            tax: totalTax,
            salesOrdersId: info.salesOrdersId,
            salesStatus: 'LOADING ORDER',
            createdBy: info.createdBy,

        };
        const result = await salesOrderRepository.createLoadingOrder(data, { transaction });
        soLoadingOrderId = result.get('soLoadingOrderId');

        // Update each inventory item with the soLoadingOrderId
        for (const inventory of info.selectedInventory) {
            for (const slab of inventory.slabData) {
                const updateData = {
                    remeasureLength: slab.remeasureLength,
                    remeasureWidth: slab.remeasureWidth,
                    soLoadingOrderId: soLoadingOrderId,
                    salesStatus: 'LOADING ORDER',
                    createdBy: info.createdBy,
                    loDate: info.loDate && info.loDate,
                };

                const updateResult = await salesOrderRepository.updateSalesOrderInventory(slab.salesOrdersInventoryId, updateData, { createdBy: info.createdBy }, { transaction });
                updateResults.push(updateResult);
            };
        };

        // Commit the transaction if all operations succeed
        await transaction.commit();
        return { success: true, message: 'Loading order processed successfully', updateResults };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error processing loading order:', error);
        return { success: false, error: error.message };
    }
};

export async function getAllSo(data, limit, page) {
    try {
        const salesOrders = await salesOrderRepository.getAllSalesOrder(data, limit, page);
        return salesOrders;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    };
};


// export async function updateStatus(transactionData) {
//     console.log('Received transaction data:', transactionData.createdBy);

//     const soLoadingOrderId = transactionData.soLoadingOrderId;
//     const transaction = await sequelize.transaction();
//     let shouldUpdateAccounts = false;

//     try {
//         const salesOrderInventory = await salesOrderRepository.findSalesOrdersInventory(soLoadingOrderId, { transaction });
//         if (salesOrderInventory.length === 0) {
//             console.log(`No sales order inventory found with id ${soLoadingOrderId}`);
//             await transaction.rollback();
//             return { success: false, message: `No sales order inventory found with id ${soLoadingOrderId}` };
//         }

//         const statusMapping = {
//             'INITIATED': 'LOADING ORDER',
//             'LOADING ORDER': 'PACKING LIST',
//             'PACKING LIST': 'INVOICE'
//         };

//         for (const inventory of salesOrderInventory) {
//             const currentStatus = inventory.dataValues.salesStatus;
//             const newStatus = statusMapping[currentStatus];

//             if (newStatus) {
//                 const salesOrdersInventoryId = inventory.dataValues.salesOrdersInventoryId;
//                 const productInventoryId = inventory.dataValues.productInventoryId;
//                 await salesOrderRepository.updateSalesStatus(salesOrdersInventoryId, { salesStatus: newStatus }, { transaction });
//                 await salesOrderRepository.updateSalesStatusLoadingOrder(soLoadingOrderId, { salesStatus: newStatus }, { transaction });

//                 console.log(`Status updated to ${newStatus} for inventory ID ${salesOrdersInventoryId}`);


//                 if (newStatus === 'INVOICE') {
//                     shouldUpdateAccounts = true;
//                 }
//             } else {
//                 console.log(`No update required for status: ${currentStatus}`);
//             }
//         }

//         if (shouldUpdateAccounts) {
//             const accNames = { creditAccountName: 'Goods', debitAccountName: 'Accounts, Notes and Loans Receivable' };
//             const transactionAccountId = await getAccountIdByAccountName(accNames);

//             console.log(transactionAccountId, 'transactionAccountId');

//             const accountDetails = [
//                 { accountsId: transactionAccountId.debitAccount.accountId, entryType: 'dr' },
//                 { accountsId: transactionAccountId.creditAccount.accountId, entryType: 'cr' }
//             ];

//             for (const accountDetail of accountDetails) {
//                 const transactionDataWithAccount = {
//                     ...transactionData,
//                     accountsId: accountDetail.accountsId,
//                     entryType: accountDetail.entryType,
//                     transactionOf: 'sales',
//                     transactionAmountType: 'debit',
//                     createdBy: transactionData.createdBy
//                 };
//                 await createSalesAccountTransaction(transactionDataWithAccount, { transaction });
//                 console.log(`Sales account transaction created with accounts ID ${accountDetail.accountsId}`);
//             }

//             const poSlabDetailIds = transactionData.soLoadingOrder.map(item => item.dataValues.poSlabDetailId);
//             for (const item of poSlabDetailIds) {
//                 const data = {
//                     poSlabDetailId: item,
//                     status: 'INACTIVE'
//                 };
//                 await updateSlabDetails(data, { transaction });
//             }

//             console.log('Product inventory set to INACTIVE for relevant items.');
//         }

//         await transaction.commit();
//         return { success: true, message: 'Status updated successfully' };

//     } catch (error) {
//         console.error('Error updating status:', error);
//         await transaction.rollback();
//         return { success: false, error: error.message };
//     }
// }


export async function updateStatus(transactionData) {
    const soLoadingOrderId = transactionData.soLoadingOrderId;
    const transaction = await sequelize.transaction();
    let shouldUpdateAccounts = false;
    let packingListAccountUpdateRequired = false;

    const creatingList = transactionData.soLoadingOrder[0].salesStatus

    try {
        const salesOrderInventory = await salesOrderRepository.findSalesOrdersInventory(soLoadingOrderId, { transaction });
        if (salesOrderInventory.length === 0) {
            console.log(`No sales order inventory found with id ${soLoadingOrderId}`);
            await transaction.rollback();
            return { success: false, message: `No sales order inventory found with id ${soLoadingOrderId}` };
        }

        //slabPick Status Change
        if (creatingList !== "LOADING ORDER") {
            const salesOrdersInventoryIds = transactionData.soLoadingOrder.map(item => item.salesOrdersInventoryId);
            for (const id of salesOrdersInventoryIds) {
                await updateSlabToPicked({ salesOrdersInventoryId: id })
            }
        }

        const statusMapping = {
            'INITIATED': 'LOADING ORDER',
            'LOADING ORDER': 'PACKING LIST',
            'PACKING LIST': 'INVOICE'
        };

        for (const inventory of salesOrderInventory) {
            const currentStatus = inventory.dataValues.salesStatus;
            const newStatus = statusMapping[currentStatus];

            if (newStatus) {
                const salesOrdersInventoryId = inventory.dataValues.salesOrdersInventoryId;
                const productInventoryId = inventory.dataValues.productInventoryId;

                if (newStatus === 'PACKING LIST') {
                    const packingDetails = transactionData.packingRemeasure.map(item => ({
                        packagingWidth: item.packagingWidth,
                        packagingLength: item.packagingLength,
                        salesStatus: newStatus,
                        poSlabDetailId: item.poSlabDetailId,
                        plDate: transactionData.plDate && transactionData.plDate,
                    }));

                    for (const packingDetail of packingDetails) {
                        await salesOrderRepository.updateSalesStatusOnPackagingList(packingDetail, { transaction });
                    }
                }
                if (newStatus !== 'PACKING LIST') {
                    await salesOrderRepository.updateSalesStatus(salesOrdersInventoryId, { salesStatus: newStatus }, { transaction });
                }
                await salesOrderRepository.updateSalesStatusLoadingOrder(soLoadingOrderId, { salesStatus: newStatus }, { transaction });
                console.log(`No update required for status: ${currentStatus}`);
            }
        }


        if (shouldUpdateAccounts) {
            const accNames = { creditAccountName: 'Goods', debitAccountName: 'Accounts, Notes and Loans Receivable' };
            const transactionAccountId = await getAccountIdByAccountName(accNames);

            const accountDetails = [
                { accountsId: transactionAccountId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: transactionAccountId.creditAccount.accountId, entryType: 'cr' }
            ];

            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...transactionData,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'sales',
                    transactionAmountType: 'debit',
                    createdBy: transactionData.createdBy
                };
                await createSalesAccountTransaction(transactionDataWithAccount, { transaction });
                console.log(`Sales account transaction created with accounts ID ${accountDetail.accountsId}`);
            }


            const poSlabDetailIds = transactionData.soLoadingOrder.map(item => item.dataValues.poSlabDetailId);
            for (const item of poSlabDetailIds) {
                const data = {
                    poSlabDetailId: item,
                    status: 'INACTIVE'
                };
                await updateSlabDetails(data, { transaction });
            }

            console.log('Product inventory set to INACTIVE for relevant items.');
        }


        if (packingListAccountUpdateRequired) {
            const packingListAccountNames = { creditAccountName: 'Finished Goods', debitAccountName: 'Cost of Goods & Services Sold' };
            const packingListAccountId = await getAccountIdByAccountName(packingListAccountNames);

            const packingListAccountDetails = [
                { accountsId: packingListAccountId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: packingListAccountId.creditAccount.accountId, entryType: 'cr' }
            ];

            for (const accountDetail of packingListAccountDetails) {
                const packingListTransactionData = {
                    ...transactionData,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'sales',
                    transactionAmountType: 'debit',
                    createdBy: transactionData.createdBy
                };
                await createSalesAccountTransaction(packingListTransactionData, { transaction });
                console.log(`Packing list account transaction created with accounts ID ${accountDetail.accountsId}`);
            }
        }

        await transaction.commit();
        return { success: true, message: 'Status updated successfully' };

    } catch (error) {
        console.error('Error updating status:', error);
        await transaction.rollback();
        return { success: false, error: error.message };
    }
};

export async function addPayment(info) {
    return await salesOrderRepository.addPayment(info)
};


// get payment details 
export async function getPaymentDetails(soLoadingOrderId) {
    return await salesOrderRepository.getPaymentDetailsFromAccountTransection(soLoadingOrderId);
};


export async function createSalesAccountTransaction(data) {
    const transaction = await sequelize.transaction();
    const accNames = { debitAccountName: 'Goods', creditAccountName: 'Accounts, Notes and Loans Receivable' }
    try {
        if (data.transactionAmountType === 'credit') {
            const transactionAccontId = await getAccountIdByAccountName(accNames);
            const accountDetails = [
                { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' },
                // { accountsId: data.paymentMethod, entryType: 'dr' }
            ];

            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...data,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'sales',
                    transactionAmountType: 'credit',
                    createdBy: data.createdBy
                };
                await purchaseAccountTransaction(transactionDataWithAccount, { transaction });
            }
        } else {
            await purchaseAccountTransaction(data, transaction);
        }

        await transaction.commit();
        return { success: true };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export async function getCustomersListOnCOA(customerId) {
    return await salesOrderRepository.getCustomersListOnCOA(customerId);
};


export async function getTransactionDataBasedAccountId() {
    const transactionData = await salesOrderRepository.getTransactionDataBasedAccountId();
    const processedData = transactionData.map(transaction => {
        const { dataValues } = transaction;
        const accountName = dataValues.account?.dataValues?.accountName || 'Unknown Account';
        const customerName = dataValues.soLoadingOrder?.sales_order?.customers?.customerName;
        const amount = dataValues?.creditAmount || dataValues?.debitAmount;
        const entryType = dataValues.entryType === 'cr' ? 'Credit' : 'Debit';
        return {
            salesAccountId: dataValues.salesAccountId,
            soLoadingOrderId: `INV#${dataValues.soLoadingOrderId}`,
            salesOrderId: dataValues.salesOrderId,
            amount: amount,
            amountDate: dataValues.creditAmountDate || dataValues.debitAmountDate,
            transactionType: dataValues.transactionType,
            accountsId: dataValues.accountsId,
            entryType: entryType,
            accountName,
            customerName
        };
    });

    const groupedData = processedData.reduce((acc, transaction) => {
        const { accountName, soLoadingOrderId, entryType, amount } = transaction;

        if (!acc[accountName]) {
            acc[accountName] = { transactions: {}, totalDebitAmount: 0, totalCreditAmount: 0 };
        }

        if (!acc[accountName].transactions[soLoadingOrderId]) {
            acc[accountName].transactions[soLoadingOrderId] = { transactions: [], totalDebitAmount: 0, totalCreditAmount: 0 };
        }

        acc[accountName].transactions[soLoadingOrderId].transactions.push(transaction);
        if (entryType === 'Debit') {
            acc[accountName].transactions[soLoadingOrderId].totalDebitAmount += amount;
            acc[accountName].totalDebitAmount += amount;
        } else {
            acc[accountName].transactions[soLoadingOrderId].totalCreditAmount += amount;
            acc[accountName].totalCreditAmount += amount;
        }

        return acc;
    }, {});

    return { transactionData, groupedData };
};


export async function closeSalesOrder(data) {
    const soLoadingOrderData = await salesOrderRepository.getSingleSalesOrder(data.salesOrdersId);

    const soLoadingOrderInfo = soLoadingOrderData.dataValues.loadingOrders
        ? soLoadingOrderData.dataValues.loadingOrders.map(order => ({
            soLoadingOrderId: order.soLoadingOrderId,
            salesStatus: order.salesStatus,
            status: order.status
        }))
        : [];

    const nonInvoiceOrders = soLoadingOrderInfo.filter(order => order.salesStatus !== "INVOICE");

    if (nonInvoiceOrders.length > 0 && !data.confirmation) {
        return {
            message: "Are you sure you want to close the Sales Order? Some loading orders are not in 'INVOICE' status.",
            nonInvoiceOrders: nonInvoiceOrders.map(order => ({
                soLoadingOrderId: order.soLoadingOrderId,
                salesStatus: order.salesStatus
            }))
        };
    }
    for (const order of soLoadingOrderInfo) {
        try {
            await salesOrderRepository.updateSalesStatusLoadingOrder(order.soLoadingOrderId, { status: 'CLOSE' });
        } catch (error) {
            console.error(`Error closing loading order ${order.soLoadingOrderId}:`, error);
            throw new Error(`Failed to close all associated loading orders. Please try again.`);
        }
    }

    const updateData = {
        ...data,
        status: 'CLOSE'
    };

    const closeResult = await salesOrderRepository.closeSalesOrder(updateData);

    return {
        message: "Sales order and all associated loading orders closed successfully.",
        closeResult: closeResult
    };
}

export async function updateSlabToPicked(info) {
    return await salesOrderRepository.updateSlabToPicked(info)
}

export async function swapSlab(info) {
    const transaction = await sequelize.transaction();
    try {
        const updateData = {
            remeasureLength: info.remeasureLength,
            remeasureWidth: info.remeasureWidth,
            // soLoadingOrderId: info.soLoadingOrderId,
            updatedBy: info.updatedBy,
            poSlabDetailId: info.poSlabDetailId,
            unitPrice: info.unitPrice
        };
        const updateResult = await salesOrderRepository.updateSalesOrderInventory(
            info.salesOrdersInventoryId,
            updateData,
            { updatedBy: info.updatedBy },
            { transaction }
        );
        await transaction.commit();
        return { success: true, message: 'Slab swapped successfully', updateResult };
    } catch (error) {
        await transaction.rollback();
        console.error('Error swapping slab:', error);
        return { success: false, error: error.message };
    }
};

export async function updateTaxService(poSlabDetailIds, taxPer) {
    try {
        if (!Array.isArray(poSlabDetailIds) || poSlabDetailIds.length === 0) {
            throw new Error("poSlabDetailIds must be a non-empty array.");
        }

        const updatePromises = poSlabDetailIds.map(async (poSlabDetailId) => {
            return await salesOrderRepository.updateTax(poSlabDetailId, taxPer);
        });
        const results = await Promise.all(updatePromises);
        return results;

    } catch (error) {
        console.error("Error in updateTaxService:", error);
        throw error;
    }
};


export async function deleteItem(poSlabDetailIds) {
    try {
        if (!Array.isArray(poSlabDetailIds) || poSlabDetailIds.length === 0) {
            throw new Error("poSlabDetailIds must be a non-empty array.");
        }

        const updatePromises = poSlabDetailIds.map(async (poSlabDetailId) => {
            return await salesOrderRepository.deleteSlab(poSlabDetailId);
        });
        const results = await Promise.all(updatePromises);
        return results;

    } catch (error) {
        console.error("Error in updateTaxService:", error);
        throw error;
    }
};

export async function getAllPL(clientId) {
    try {
        return await salesOrderRepository.fetchAllPl(clientId);
    } catch (error) {
        console.error("Error whle Fetching PL:", error);
        throw error;
    }
};