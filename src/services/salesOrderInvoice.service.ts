import _ from "lodash";
import * as salesOrderInvoiceRepository from "../repositories/soInvoice.repository";


export const fetchTotalAmountFromLastNDays = async (fromDate: string, toDate: string, clientId: number) => {
    return await salesOrderInvoiceRepository.getTotalAmountFromLastNDays(fromDate, toDate, clientId);
};

export const getTotalAmountForClient = async (clientId: number) => {
    return await salesOrderInvoiceRepository.getTotalAmountForClient(clientId);
}

export const getAllSoInvoiceList = async (clientId: number, filter: any, page: number, limit: number) => {
    const data: any = await salesOrderInvoiceRepository.getAllInvoicesList(clientId, filter, page, limit);

    data.rows = data.rows.map((invoice: any) => {
        invoice = invoice.get({ plain: true });

        if (invoice.loadingOrder.packagingList) {
            invoice.totalQuantity = _.sumBy(invoice.loadingOrder.salesOrderProducts, (item: any) => item.plRemeasureLength * item.plRemeasureWidth)
        } else {
            invoice.totalQuantity = _.sumBy(invoice.loadingOrder.salesOrderProducts, (item: any) => item.loRemeasureLength * item.loRemeasureWidth)
        }

        invoice.totalSlabs = invoice.loadingOrder.salesOrderProducts.length

        return { ...invoice }
    })

    return data
}

