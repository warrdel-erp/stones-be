import { AppError } from "../helper/appError";
import * as serviceRepository from "../repositories/service.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import * as customerRepository from "../repositories/customer.repository";
import * as productRepository from "../repositories/product.repository";
import * as vendorRepository from "../repositories/vendor.repository";
import * as customerAddressRepository from "../repositories/customerAddress.repository";
import * as locationRepository from "../repositories/location.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { CUSTOMER_STATUS, CUSTOMER_ADDRESS_TYPES, VENDOR_TYPES } from "../constants/tableTypes";

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

    return invoices;
};

export const getCustomerOptions = async (clientId: number, activeOnly: boolean = true) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const status = activeOnly ? CUSTOMER_STATUS.ACTIVE : undefined;
    const customers = await customerRepository.getCustomerOptions(clientId, status);

    return customers;
};

export const getProductOptions = async (clientId: number, activeOnly: boolean = true) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const status = activeOnly ? "active" : undefined;
    const products = await productRepository.getProductOptions(clientId, status);

    return products;
};

export const getVendorOptions = async (
    clientId: number,
    activeOnly: boolean = true,
    type?: (typeof VENDOR_TYPES)[keyof typeof VENDOR_TYPES]
) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const status = activeOnly ? "active" : undefined;
    const vendors = await vendorRepository.getVendorOptions(clientId, status, type);

    return vendors;
};

export const getCustomerAddressOptions = async (
    customerId: number,
    addressType?: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES]
) => {
    if (!customerId) {
        throw new AppError("Customer ID is required.", 400);
    }

    const addresses = await customerAddressRepository.getCustomerAddressOptions(customerId, addressType);

    return addresses;
};

export const getLocationOptions = async (clientId: number, activeOnly: boolean = true) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const status = activeOnly ? "active" : undefined;
    const locations = await locationRepository.getLocationOptions(clientId, status);

    return locations;
};

export const getLedgerAccountOptions = async (clientId: number, filters: any = {}) => {
    if (!clientId) {
        throw new AppError("Client context missing.", 400);
    }

    const ledgerAccounts = await ledgerAccountRepository.getLedgerAccountOptions(clientId, filters);

    return ledgerAccounts;
};

