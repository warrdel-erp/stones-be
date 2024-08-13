import * as salesOrderRepository from '../repository/salesOrderRepository.js';
import moment from 'moment';
import sequelize from '../database/sequelizeConfig.js';
import { updateProductInventoryInactive } from '../repository/productInventoryRespository.js';
import { purchaseAccountTransaction, updateSlabDetails } from '../repository/purchaseOrderRepository.js';
import { getAccountIdByAccountName } from './accountsServices.js';

export async function createOrder(info) {
    return await salesOrderRepository.createOrder(info)
}

export async function getSoNumber() {
    const result = await salesOrderRepository.latestPoNumber()
    let newSo; // declare newSo outside the if-else blocks
    if (!result) {
        newSo = "0001";
    } else {
        let lastPo = parseInt(result.get('so'));
        newSo = String(lastPo + 1).padStart(4, '0');
    }
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
            for (const slab of inventory.selectedSlabs) {
                const productData = {
                    salesOrdersId: info.salesOrdersId,
                    productInventoryId: inventory.productInventoryId,
                    poSlabDetailId: slab.poSlabDetailId,
                    unitPrice: inventory.unitPrice,
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
            salesStatus: 'LOADING ORDER'
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
                    salesStatus: 'LOADING ORDER'
                };
                const updateResult = await salesOrderRepository.updateSalesOrderInventory(slab.salesOrdersInventoryId, updateData, { transaction });
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

export async function getAllSo(search) {
    try {
        const salesOrders = await salesOrderRepository.getAllSalesOrder(search);
        return salesOrders;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    };
};

export async function updateStatus(transactionData) {
    console.log('Received transaction data:', JSON.stringify(transactionData));

    const soLoadingOrderId = transactionData.soLoadingOrderId;
    const transaction = await sequelize.transaction();
    try {
        const salesOrderInventory = await salesOrderRepository.findSalesOrdersInventory(soLoadingOrderId, { transaction });
        if (salesOrderInventory.length === 0) {
            console.log(`No sales order inventory found with id ${soLoadingOrderId}`);
            await transaction.rollback();
            return { success: false, message: `No sales order inventory found with id ${soLoadingOrderId}` };
        }

        const statusMapping = {
            'INITIATED': 'LOADING ORDER',
            'LOADING ORDER': 'PACKING LIST',
            'PACKING LIST': 'INVOICE'
        };

        let data = {};
        for (const inventory of salesOrderInventory) {
            data = {
                salesOrdersInventoryId: inventory.dataValues.salesOrdersInventoryId,
                productInventoryId: inventory.dataValues.productInventoryId,
                status: inventory.dataValues.salesStatus,
            };
        }

        const currentStatus = data.status;
        const newStatus = statusMapping[currentStatus];

        if (newStatus) {
            await salesOrderRepository.updateSalesStatus(data.salesOrdersInventoryId, { salesStatus: newStatus }, { transaction });
            await salesOrderRepository.updateSalesStatusLoadingOrder(soLoadingOrderId, { salesStatus: newStatus }, { transaction });

            console.log(`Status updated to ${newStatus} for inventory ID ${data.salesOrdersInventoryId}`);
            if (newStatus === 'INVOICE') {
                // Static account details for INVOICE status

                const accNames = { creditAccountName: 'Goods', debitAccountName: 'Accounts, Notes and Loans Receivable' }

                const transactionAccontId = await getAccountIdByAccountName(accNames);
                console.log(transactionAccontId, 'transactionAccontId');
                const accountDetails = [
                    { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
                    { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' }
                ];
                for (const accountDetail of accountDetails) {
                    const transactionDataWithAccount = {
                        ...transactionData,
                        accountsId: accountDetail.accountsId,
                        entryType: accountDetail.entryType,
                        transactionOf: 'sales',
                        transactionAmountType: 'debit'
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
                
                console.log(`Product inventory ID ${data.productInventoryId} set to INACTIVE`);

                await transaction.commit();
                return {
                    success: true,
                    salesOrderUpdateResult: true,
                    // updateSlabDetailsStatus
                };
            } else {
                await transaction.commit();
                return { success: true, message: 'Status updated successfully' };
            }
        } else {
            console.log(`No update required for status: ${currentStatus}`);
            await transaction.rollback();
            return { success: false, message: `No update required because the current status value is: ${currentStatus}` };
        }
    } catch (error) {
        console.error('Error updating status:', error);
        await transaction.rollback();
        return { success: false, error: error.message };
    }
}




export async function addPayment(info) {
    return await salesOrderRepository.addPayment(info)
};


export async function getPaymentDetails(soLoadingOrderId, salesOrderId) {
    return await salesOrderRepository.getPaymentDetails(soLoadingOrderId, salesOrderId)
};

export async function createSalesAccountTransaction(data) {
    console.log(data, 'data');

    const transaction = await sequelize.transaction();
    const accNames = { debitAccountName: 'Goods', creditAccountName: 'Accounts, Notes and Loans Receivable' }
    try {
        if (data.transactionAmountType === 'credit') {
            const transactionAccontId = await getAccountIdByAccountName(accNames);
            console.log(transactionAccontId, 'transactionAccontId');
            const accountDetails = [
                { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' }
            ];

            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...data,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'sales',
                    transactionAmountType: 'credit'
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

