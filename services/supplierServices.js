import * as supplierRepository from '../repository/supplierRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addSupplier(info) {
    return await supplierRepository.addSupplier(info)
}

export async function getAllSupplier(data) {
    return await supplierRepository.getAllSupplierName(data)
}

export async function getSingleSupplierDetails(productName) {
    const supplierDetails = await supplierRepository.getSingleSupplier(productName);
    const transactions = supplierDetails.dataValues.supplierTransactions;
    let totalDebitAmount = 0;
    let totalCreditAmount = 0;
    let creditTransactions = []; 
    if (Array.isArray(transactions)) {
        transactions.forEach(transaction => {
            const transactionAmount = transaction.dataValues.transactionAmount;
            const transactionType = transaction.dataValues.transactionAmountType;

            if (transactionType === 'debit') {
                totalDebitAmount += transactionAmount;
            } else if (transactionType === 'credit') {
                totalCreditAmount += transactionAmount;
                creditTransactions.push(transaction.dataValues); 
            }
        });

        const payableBalance = totalDebitAmount - totalCreditAmount;

        return {
            creditBalance: totalCreditAmount,
            unappliedBalance: totalDebitAmount,
            payableBalance: payableBalance,
            payments: creditTransactions,
            supplierDetails: supplierDetails.dataValues,
        };
    } else {
        console.log('No transactions found for this supplier.');

        return {
            creditBalance: 0,
            unappliedBalance: 0,
            payableBalance: 0,
            payments: [], 
            supplierDetails: supplierDetails,
        };
    }
}




export async function updateSupplier(productName, info) {
    return await supplierRepository.updateSupplier(productName, info)
}

export async function addWritingInstructions( info) {
    return await supplierRepository.addWritingInstructions(info)
}