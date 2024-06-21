import * as dashboardRepository from '../repository/dashboardRepository.js';


export async function getDashBoardData(fromDate, toDate) {
    try {
        // Execute all promises concurrently
        const [totalPurchase, openPo, totalSales,openSo,soNotes,poNotes,stockInventory,lowStock] = await Promise.all([
            dashboardRepository.getTotalPurchase(fromDate, toDate),
            dashboardRepository.getOpenPo(fromDate, toDate),
            dashboardRepository.getTotalsales(fromDate, toDate),
            dashboardRepository.getOpenSo(fromDate,toDate),
            dashboardRepository.soNotes(fromDate,toDate),
            dashboardRepository.poNotes(fromDate,toDate),
            dashboardRepository.stockInventory(fromDate,toDate),
            dashboardRepository.lowStock(fromDate, toDate),
        ]);
    
        //calculate total earning
        const totalEarnings = totalPurchase - totalSales;

        return { totalPurchase, openPo, totalSales,openSo,soNotes,poNotes,stockInventory,lowStock,totalEarnings};
    } catch (error) {
        console.error('Error fetching Dashboard Data:', error);
        throw error;
    };
};

export async function getCalenderMonth(fromDate,toDate){
    return await dashboardRepository.getCalenderMonthData(fromDate,toDate)
};

export async function getCalenderDate(date){
    return await dashboardRepository.getCalenderDateData(date)
};