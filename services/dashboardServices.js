import * as dashboardRepository from '../repository/dashboardRepository.js';


export async function getDashBoardData(fromDate, toDate) {
    console.log(`>>>>>>>>>fromDate,toDate>>>>>>`, fromDate, toDate);
    try {
        // Execute all promises concurrently
        const [totalPurchase, openPo, totalSales,openSo,soNotes,poNotes] = await Promise.all([
            dashboardRepository.getTotalPurchase(fromDate, toDate),
            dashboardRepository.getOpenPo(fromDate, toDate),
            dashboardRepository.getTotalsales(fromDate, toDate),
            dashboardRepository.getOpenSo(fromDate,toDate),
            dashboardRepository.soNotes(fromDate,toDate),
            dashboardRepository.poNotes(fromDate,toDate),
        ]);
        return { totalPurchase, openPo, totalSales,openSo,soNotes,poNotes};
    } catch (error) {
        console.error('Error fetching Dashboard Data:', error);
        throw error;
    }
}