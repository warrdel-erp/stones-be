import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";


export const fetchTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {
    return await salesOrderInvoiceRepository.getTotalAmountFromLastNDays(fromDate, toDate, clientId);
};

export const getTotalAmountForClient = async (clientId: number) => {
    return await salesOrderInvoiceRepository.getTotalAmountForClient(clientId);
}
