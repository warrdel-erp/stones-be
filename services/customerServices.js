import * as customerRepository from '../repository/customerRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
import { getAccountTransactionCustomer } from '../repository/accountsRepository.js';
export async function addCustomer(info) {
    return await customerRepository.addCustomer(info);
}

export async function getAllCustomers(data) {
    return await customerRepository.getAllCustomers(data);
}

export async function getSingleCustomer(customerName) {
    console.log('customerName---------------', customerName);
    const customerDetails = await customerRepository.getSingleCustomer(customerName);

    const customerId = customerDetails.dataValues.customerId;
    const currentDate = new Date();

    const ranges = [
        { name: 'creditSum_0_30', start: 0, end: 30 },
        { name: 'creditSum_31_45', start: 31, end: 45 },
        { name: 'creditSum_46_60', start: 46, end: 60 },
        { name: 'creditSum_over_60', start: 61, end: null }
    ];

    let totalDays = 0;
    let creditTransactionCount = 0;
    let totalLoadingOrderSum = 0;
    let totalReceivedAmount = 0;

    const creditSums = {
        creditSum_0_30: 0,
        creditSum_31_45: 0,
        creditSum_46_60: 0,
        creditSum_over_60: 0
    };

    for (const range of ranges) {
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - range.end);
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() - range.start);

        const transactions = await getAccountTransactionCustomer(customerId, startDate, endDate);


        transactions.forEach(transaction => {
            if (transaction.transactionAmountType === 'credit') {
                creditTransactionCount++;
                const transactionDate = new Date(transaction.transactionAmountDate);
                const diffInDays = (currentDate - transactionDate) / (1000 * 3600 * 24);
                totalDays += diffInDays;

                creditSums[range.name] += transaction.transactionAmount;
                totalReceivedAmount += transaction.transactionAmount;
            }
        });
    }

    if (customerDetails.dataValues.sales_orders) {
        customerDetails.dataValues.sales_orders.forEach(salesOrder => {
            let loadingOrderTotal = 0;

            if (Array.isArray(salesOrder.dataValues.loadingOrders)) {
                loadingOrderTotal = salesOrder.dataValues.loadingOrders.reduce((sum, order) => {
                    return sum + (order.dataValues.total || 0);
                }, 0);
            }

            totalLoadingOrderSum += loadingOrderTotal;
        });
    }

    const averageDaysToPay = creditTransactionCount > 0 ? (totalDays / creditTransactionCount) : 0;
    const unappliedReceipts = totalLoadingOrderSum - totalReceivedAmount;

    const calculatedData = {
        ...creditSums,
        averageDaysToPay: averageDaysToPay.toFixed(2),
        unappliedReceipts,
        totalReceivedAmount
    };

    return {
        ...customerDetails.dataValues,
        calculatedData
    };
}




export async function getCustomerID() {
    const result = await customerRepository.getCustomerID()
    let customerNumber; // declare newPo outside the if-else blocks
    if (!result) {
        customerNumber = "0001";
    } else {
        let lastCustomerID = parseInt(result.get('customerId'));
        customerNumber = String(lastCustomerID + 1).padStart(4, '0');
    }
    return customerNumber;
    // return await customerRepository.getCustomerID();
}