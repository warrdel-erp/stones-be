import * as accountsRepository from '../repository/accountsRepository.js';

export async function addAccount(info) {
    return await accountsRepository.addAccount(info);
};
getAllAccountsTypeAndSubTypes
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
        console.log(data, 'jsdjsj');
        const accountDetails = await accountsRepository.getAccountIdByAccountName(data);
        return accountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}

//get coa account details
export async function getCOATransactionDetails(queryParams) {
    return await accountsRepository.getCOATransactionDetails(queryParams);
}


//get transaction history based on supplier and customers

export async function getTransactionSupplierCustomer(typeOfData) {
    let dataApi
    if (typeOfData.type === 'sales') {
        dataApi = await accountsRepository.getSalesTransactions();
    }
    else if (typeOfData.type == 'purchase') {
        dataApi = await accountsRepository.getPurchaseTransactions();
    }

    let initialBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const getPrefixFromAccountName = (accountName) => {
        return accountName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    };

    const processTransactions = (transactions, isSales) => {
        let balance = initialBalance;

        return transactions.map(transaction => {
            const debitAmount = transaction.entryType === 'dr' ? transaction.transactionAmount : 0;
            const creditAmount = transaction.entryType === 'cr' ? transaction.transactionAmount : 0;
            totalDebit += debitAmount;
            totalCredit += creditAmount;

            if (transaction.account.accountBalance === 'Dr') {
                balance = balance + debitAmount - creditAmount;
            } else if (transaction.account.accountBalance === 'Cr') {
                balance = balance + creditAmount - debitAmount;
            }

            const prefix = getPrefixFromAccountName(transaction.account.accountName);
            const transactionId = isSales
                ? `${prefix}-SO#${transaction.so}-${transaction.soLoadingOrderId}-${transaction.accountTransactionId}`
                : `${prefix}-PO#${transaction.purchaseOrderId}-${transaction.poSupplierInvoiceMapperId}-${transaction.accountTransactionId}`;

            return {
                accountTransactionId: transaction.accountTransactionId,
                transactionDate: transaction.createdAt,
                accountsId: transaction.accountsId,
                entryType: transaction.entryType,
                debitAmount: debitAmount,
                creditAmount: creditAmount,
                paymentMethod: transaction.paymentMethod,
                accountBalance: transaction.account.accountBalance,
                accountName: transaction.account.accountName,
                balancedAmount: balance,
                transactionId: transactionId,
                ...(!isSales && {
                    poSupplierInvoiceMapperId: transaction.poSupplierInvoiceMapperId,
                    purchaseOrderId: transaction.purchaseOrderId,
                }),
                ...(isSales && {
                    soLoadingOrderId: transaction.soLoadingOrderId,
                    so: transaction.so,
                }),
            };
        });
    };

    const filteredData = dataApi
        .filter(entity => {
            return typeOfData.type === 'sales'
                ? entity.customerTransactions.length > 0
                : entity.supplierTransactions.length > 0;
        })
        .map(entity => {
            const transactions = typeOfData.type === 'sales'
                ? entity.customerTransactions
                : entity.supplierTransactions;
            const transactionData = processTransactions(transactions, typeOfData.type === 'sales');

            return {
                ...(
                    typeOfData.type === 'sales'
                        ? { customerId: entity.dataValues.customerId, customerName: entity.dataValues.customerName.trim() }
                        : { supplierId: entity.dataValues.supplierId, supplierName: entity.dataValues.supplierName.trim() }
                ),
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                transactionData: transactionData,
            };
        });

    return filteredData;
}

