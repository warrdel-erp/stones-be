import { getClientDetails } from '../repository/clientRepository.js';
import * as dashboardRepository from '../repository/dashboardRepository.js';

function convertExponentialToDecimal(exponentialNumber) {
    const str = exponentialNumber.toString();

    // Check for 'e-' (negative exponent)
    if (str.indexOf('e-') !== -1) {
        const [base, exponent] = str.split('e-');
        const decimalPlaces = parseInt(exponent, 10);
        return Number(base).toFixed(decimalPlaces);
    }

    // Check for 'e+' (positive exponent)
    if (str.indexOf('e+') !== -1) {
        let [base, exponent] = str.split('e+');
        exponent = parseInt(exponent, 10);
        let [integerPart, decimalPart] = base.split('.');

        if (decimalPart) {
            exponent -= decimalPart.length;
        } else {
            decimalPart = '';
        }

        const result = integerPart + decimalPart + '0'.repeat(exponent);
        return Number(result);
    }

    // If not exponential notation, return the number as-is
    return Number(exponentialNumber);
}

function formatLargeNumber(number) {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;

    while (number >= 1000 && unitIndex < units.length - 1) {
        number /= 1000;
        unitIndex++;
    }

    return number.toFixed(2) + ' ' + units[unitIndex];
}

export async function getDashBoardData(fromDate, toDate, clientId) {
    try {

        const [totalPurchase, openPo, totalSales, openSo, soNotes, poNotes, stockInventory, lowStock] = await Promise.all([
            dashboardRepository.getTotalPurchase(fromDate, toDate, clientId),
            dashboardRepository.getOpenPo(fromDate, toDate, clientId),
            dashboardRepository.getTotalsales(fromDate, toDate, clientId),
            dashboardRepository.getOpenSo(fromDate, toDate, clientId),
            dashboardRepository.soNotes(fromDate, toDate, clientId),
            dashboardRepository.poNotes(fromDate, toDate, clientId),
            dashboardRepository.stockInventory(fromDate, toDate, clientId),
            dashboardRepository.lowStock(fromDate, toDate, clientId),
        ]);
        const clientData = await getClientDetails({ clientId: clientId });
        const clientName = clientData.dataValues.clientName;
        const clientEmail = clientData.dataValues.clientEmail;
        const clientLocation = clientData.dataValues.clientLocation;

        // Calculate total earnings
        const totalEarnings = totalPurchase - totalSales;

        // Convert totalPurchase and totalSales to decimal if they are in exponential notation
        const totalPurchaseDecimal = convertExponentialToDecimal(totalPurchase);
        const totalSalesDecimal = convertExponentialToDecimal(totalSales);

        // Format totalPurchase and totalSales to appropriate units
        const totalPurchaseFormatted = formatLargeNumber(totalPurchaseDecimal);
        const totalSalesFormatted = formatLargeNumber(totalSalesDecimal);


        return {
            totalPurchase: totalPurchaseFormatted,
            openPo,
            totalSales: totalSalesFormatted,
            openSo,
            soNotes,
            poNotes,
            stockInventory,
            lowStock,
            totalEarnings: formatLargeNumber(totalEarnings),
            clientDetails: {
                clientName,
                clientEmail,
                clientLocation
            }
        };
    } catch (error) {
        console.error('Error fetching Dashboard Data:', error);
        throw error;
    }
}

export async function getCalenderMonth(fromDate, toDate) {
    return await dashboardRepository.getCalenderMonthData(fromDate, toDate);
}

export async function getCalenderDate(date) {
    return await dashboardRepository.getCalenderDateData(date);
}
