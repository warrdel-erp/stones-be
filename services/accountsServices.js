import * as accountsRepository from '../repository/accountsRepository.js';
import sequelize from '../database/sequelizeConfig.js';

export async function addAccount(info) {
    return await accountsRepository.addAccount(info);
};
export async function getAllAccounts(search) {
    try {
        const salesOrders = await accountsRepository.getAllAccounts(search);
        return salesOrders;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
};

export async function getAllAccountsTypeAndSubTypes() {
    try {
        const salesOrders = await accountsRepository.getAllTypeSubTypes();
        return salesOrders;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}

export async function updateAccount(accountsId, info) {
    return await accountsRepository.updateAccount(accountsId, info)
}

export async function deleteAccount(accountsId) {
    try {
        const accountDetails = await accountsRepository.findAccountNumber(accountsId);
        const canDelete = accountDetails.dataValues.canDelete;

        if (!canDelete) {
            await accountsRepository.deleteAccount(accountsId);
            return { message: 'Account deleted successfully' };
        } else {
            return { message: 'This account cannot be deleted because it is a permanent account' };
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        return { message: 'An error occurred while trying to delete the account', error: error.message };
    }
}



export async function getCashFinancialAssestOptions() {
    try {
        const subAccountDetails = await accountsRepository.getCashFinancialAssestOptions();
        return subAccountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}


export async function getGroupedAccountList() {
    try {
        const subAccountDetails = await accountsRepository.getGroupedAccountList();
        return subAccountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}


export async function getAccountIdByAccountName(data) {
    try {
        const accountDetails = await accountsRepository.getAccountIdByAccountName(data);
        return accountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}

//get coa account details

export async function getCOATransactionDetails(queryParams) {
    const apiData = await accountsRepository.getCOATransactionDetails(queryParams);
    let previousAccountLevelTotal = 0;
    let previousTransactionLevelTotal = 0;

    const filteredData = apiData.map((subAccountData) => {
        let accountTypeDebitTotal = 0;
        let accountTypeCreditTotal = 0;

        const accountSubtype = subAccountData.accountSubtype.map((account) => {
            let debitTotal = 0;
            let creditTotal = 0;

            const accountTransactions = account.account_transactions.map((transaction) => {
                let creditAmount = 0;
                let debitAmount = 0;

                if (transaction.entryType === 'cr') {
                    creditAmount = transaction.transactionAmount;
                    creditTotal += creditAmount;
                } else if (transaction.entryType === 'dr') {
                    debitAmount = transaction.transactionAmount;
                    debitTotal += debitAmount;
                }
                const transactionLevelTotal = account.accountBalance === 'Dr'
                    ? previousTransactionLevelTotal + debitAmount - creditAmount :
                    previousTransactionLevelTotal + creditAmount - debitAmount;
                previousTransactionLevelTotal = transactionLevelTotal;
                return {
                    transactionId: transaction.accountTransactionId,
                    transactionAmount: transaction.transactionAmount,
                    creditAmount,
                    debitAmount,
                    transactionLevelTotal,
                    entryType: transaction.entryType,
                    transactionDate: transaction.createdAt,
                    paymentMethod: transaction.paymentMethod,
                    transactionAmountType: transaction.transactionAmountType,
                    transactionOf: transaction.transactionOf,
                    poSupplierInvoice: transaction.poSupplierInvoice,
                    poSupplierInvoiceMapperId: transaction.poSupplierInvoiceMapperId,
                    purchaseOrderId: transaction.purchaseOrderId,
                    so: transaction.so,
                    soLoadingOrders: transaction.soLoadingOrders,
                    soLoadingOrderId: transaction.soLoadingOrderId,
                    purchaseOrder: transaction.purchaseOrder
                };
            });

            accountTypeDebitTotal += debitTotal;
            accountTypeCreditTotal += creditTotal;
            const accountLevelTotal = account.accountBalance === 'Dr'
                ? previousAccountLevelTotal + debitTotal - creditTotal
                : previousAccountLevelTotal + creditTotal - debitTotal;
            previousAccountLevelTotal = accountLevelTotal;

            return {
                accountName: account.accountName,
                accountBalance: account.accountBalance,
                accountTransactions,
                debitTotal,
                creditTotal,
                accountLevelTotal
            };
        });

        return {
            subAccountType: subAccountData.subAccountType,
            accountSubtype,
            debitTotal: accountTypeDebitTotal,
            creditTotal: accountTypeCreditTotal,
            subAccountTypesId: subAccountData.subAccountTypesId,
            subAccountTotal: accountTypeDebitTotal - accountTypeCreditTotal
        };
    });

    const overallDebitTotal = filteredData.reduce((sum, data) => sum + data.debitTotal, 0);
    const overallCreditTotal = filteredData.reduce((sum, data) => sum + data.creditTotal, 0);

    const combinedData = {
        filteredData,
        overallDebitTotal,
        overallCreditTotal
    };

    return combinedData;
}



//get transaction history based on supplier and customers

export async function getTransactionSupplierCustomer(typeOfData, queryParams, clientId) {
    const { limit = 1, offset = 0, customerId, supplierId } = queryParams;

    const dataApi = await (typeOfData.type === 'sales'
        ? accountsRepository.getSalesTransactions(customerId, limit, offset, clientId, queryParams)
        : typeOfData.type === 'purchase'
            ? accountsRepository.getPurchaseTransactions(supplierId, limit, offset, clientId, queryParams)
            : Promise.resolve(null));

    let initialBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    let totalDebitBalance = 0;
    let totalCreditBalance = 0;
    let balancedCalculatedAmount = 0

    const getPrefixFromAccountName = (accountName) => {
        return accountName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    };

    const formatCurrency = (amount) => {
        const formattedAmount = Math.abs(amount).toFixed(2);
        return amount < 0 ? `-$${formattedAmount}` : `$${formattedAmount}`;
    };

    const processTransactions = (transactions, isSales) => {
        let balance = initialBalance;

        return transactions.map(transaction => {
            const debitAmount = transaction.entryType === 'dr' ? transaction.transactionAmount : 0;
            const creditAmount = transaction.entryType === 'cr' ? transaction.transactionAmount : 0;
            const debitBalance = transaction.transactionAmountType === 'debit' ? transaction.transactionAmount : 0;
            const creditBalance = transaction.transactionAmountType === 'credit' ? transaction.transactionAmount : 0;
            totalDebit += debitAmount;
            totalCredit += creditAmount;
            totalDebitBalance += debitBalance;
            totalCreditBalance += creditBalance;

            if (transaction.account.accountBalance === 'Dr') {
                balance = balance + debitAmount - creditAmount;
            } else if (transaction.account.accountBalance === 'Cr') {
                balance = balance + creditAmount - debitAmount;
            }

            const prefix = getPrefixFromAccountName(transaction.account.accountName);
            const transactionId = isSales
                ? `${prefix}-LO#${transaction.so}-${transaction.soLoadingOrderId}-${transaction.accountTransactionId}`
                : `${prefix}-#${transaction.poSupplierInvoice.transaction}-${transaction.accountTransactionId}`;

            const result = {
                accountTransactionId: transaction.accountTransactionId,
                transactionDate: transaction.createdAt,
                accountsId: transaction.accountsId,
                entryType: transaction.entryType,
                transactionAmountType: transaction.transactionAmountType,
                debitAmount: formatCurrency(debitAmount),
                creditAmount: formatCurrency(creditAmount),
                paymentMethod: transaction.paymentMethod,
                accountBalance: transaction.account.accountBalance,
                accountName: transaction.account.accountName,
                balancedAmount: formatCurrency(balance),
                transactionId: transactionId,
                balancedCalculatedAmount: formatCurrency(balance),
                ...(!isSales && {
                    poSupplierInvoiceMapperId: transaction.poSupplierInvoiceMapperId,
                    purchaseOrderId: transaction.purchaseOrderId,
                }),
                ...(isSales && {
                    soLoadingOrderId: transaction.soLoadingOrderId,
                    so: transaction.so,
                }),
            };

            return result;
        });
    };

    const filteredData = dataApi
        .filter(entity => {
            return typeOfData.type === 'sales'
                ? entity.customerTransactions.length > 0
                : entity.supplierTransactions.length > 0;
        })
        .map(entity => {
            let transactions = typeOfData.type === 'sales'
                ? entity.customerTransactions
                : entity.supplierTransactions;

            if (customerId) {
                transactions = transactions.filter(transaction =>
                    ['Accounts, Notes and Loans Receivable'].includes(transaction.account.accountName)
                );
            } else if (supplierId) {
                transactions = transactions.filter(transaction =>
                    transaction.account.accountName === 'Trade Payables'
                );
            }

            const transactionData = processTransactions(transactions, typeOfData.type === 'sales');

            return {
                ...(
                    typeOfData.type === 'sales'
                        ? { customerId: entity.dataValues.customerId, customerName: entity.dataValues.customerName.trim() }
                        : { supplierId: entity.dataValues.supplierId, supplierName: entity.dataValues.supplierName.trim() }
                ),
                totalDebit: formatCurrency(totalDebit),
                totalCredit: formatCurrency(totalCredit),
                totalBalance: balancedCalculatedAmount,
                ...(queryParams.supplierId != null || queryParams.customerId != null ? { transactionData: transactionData } : {}),
            };
        });

    return filteredData;
}



export async function journalEntryCreation(infoArray) {
    const transaction = await sequelize.transaction();
    try {
        const results = [];
        for (const info of infoArray) {
            const result = await accountsRepository.journalEntryCreation(info, { transaction });
            results.push(result);
        }
        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
