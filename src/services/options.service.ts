import { AppError } from "../helper/appError";
import * as serviceRepository from "../repositories/service.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";

type ServiceOptionFilters = {
    purchaseOnly?: boolean;
    salesOnly?: boolean;
};

const resolveTypeFilter = ({ purchaseOnly, salesOnly }: ServiceOptionFilters = {}) => {
    if (purchaseOnly && salesOnly) {
        throw new AppError("Choose either purchaseOnly or salesOnly filter, not both.", 400);
    }

    if (purchaseOnly) return "purchase";
    if (salesOnly) return "sale";
    return undefined;
};

export const getServiceOptions = async (clientId: number, filters: ServiceOptionFilters = {}) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const typeFilter = resolveTypeFilter(filters);
    const services = await serviceRepository.getServiceOptions(clientId, typeFilter);

    return services
};

export const getCustomerInvoiceOptions = async (customerId: number) => {
    if (!customerId) {
        throw new AppError("Customer ID is required.", 400);
    }

    const invoices = await soInvoiceRepository.getCustomerAllInvoicesOptions({ customerId });

    return invoices
};

