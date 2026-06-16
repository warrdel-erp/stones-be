import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as optionsService from "../services/options.service";
import { CUSTOMER_ADDRESS_TYPES, VENDOR_TYPES } from "../constants/tableTypes";

export const getServiceOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const purchaseOnly = req.query.purchaseOnly === "true";
    const salesOnly = req.query.salesOnly === "true";

    const data = await optionsService.getServiceOptions(Number(clientId), {
        purchaseOnly,
        salesOnly,
    });

    SuccessResponse(res, 200, "Service options fetched successfully.", data);
});

export const getCustomerInvoiceOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const customerId = Number(req.params.customerId);

    const data = await optionsService.getCustomerInvoiceOptions(customerId);

    SuccessResponse(res, 200, "Customer invoice options fetched successfully.", data);
});

export const getCustomerOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const { activeOnly, ...filters } = req.query;
    const isActiveOnly = activeOnly !== "false"; // Default to true, but allow false

    const data = await optionsService.getCustomerOptions(Number(clientId), isActiveOnly, filters);

    SuccessResponse(res, 200, "Customer options fetched successfully.", data);
});

export const getProductOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const activeOnly = req.query.activeOnly !== "false"; // Default to true, but allow false

    const data = await optionsService.getProductOptions(Number(clientId), activeOnly);

    SuccessResponse(res, 200, "Product options fetched successfully.", data);
});

export const getVendorOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const activeOnly = req.query.activeOnly !== "false"; // Default to true, but allow false
    const { type } = req.query as { type: (typeof VENDOR_TYPES)[keyof typeof VENDOR_TYPES] };

    const data = await optionsService.getVendorOptions(Number(clientId), activeOnly, type);

    SuccessResponse(res, 200, "Vendor options fetched successfully.", data);
});

export const getCustomerAddressOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const { customerId } = req.params
    const { addressType } = req.query as { addressType: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES] };

    const data = await optionsService.getCustomerAddressOptions(
        Number(customerId),
        addressType
    );

    SuccessResponse(res, 200, "Customer address options fetched successfully.", data);
});

export const getLocationOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const activeOnly = req.query.activeOnly !== "false"; // Default to true, but allow false

    const data = await optionsService.getLocationOptions(Number(clientId), activeOnly);

    SuccessResponse(res, 200, "Location options fetched successfully.", data);
});

export const getLedgerAccountOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    const { ...filters } = req.query;

    const data = await optionsService.getLedgerAccountOptions(Number(clientId), filters);

    SuccessResponse(res, 200, "Ledger account options fetched successfully.", data);
});

export const getProductSubCategoryOptions = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = await optionsService.getProductSubCategoryOptions(Number(clientId));

    SuccessResponse(res, 200, "Product subcategory options fetched successfully.", data);
});
