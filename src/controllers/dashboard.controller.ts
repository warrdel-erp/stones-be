import { Request, Response } from "express";
import { AppError } from "../helper/appError";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as salesOrderInvoiceService from "../services/salesOrderInvoice.service";
import * as siplProductService from "../services/siplProduct.service";
import * as purchaseOrderService from "../services/purchaseOrder.service";
import * as salesOrderService from "../services/salesOrder.service";
import * as paymentService from "../services/payment.service";
import * as billService from "../services/bill.service";
import * as productCategoryService from "../services/productCategory.service";

// Get total amount of sales invoices from last N days
export const getTotalAmountFromLastNDays = catchAsync(async (req: AuthRequest, res: Response) => {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
        throw new AppError("fromDate and toDate are required query parameters", 400);
    }

    const clientId = req.user?.clientId;

    const totalAmount = await salesOrderInvoiceService.fetchTotalAmountFromLastNDays(fromDate as string, toDate as string, Number(clientId));

    return SuccessResponse(res, 200, "Total amount fetched successfully", {
        fromDate,
        toDate,
        totalAmount,
    });
});

export const getTotalSIPLProductAmount = catchAsync(async (req: AuthRequest, res: Response) => {
    const { fromDate, toDate } = req.query;
    const clientId = req.user?.clientId;

    if (!fromDate || !toDate) {
        return res.status(400).json({
            status: "fail",
            message: "fromDate and toDate are required query parameters",
        });
    }

    const totalAmount = await siplProductService.fetchTotalSIPLProductAmount(
        fromDate as string,
        toDate as string,
        Number(clientId)
    );

    return SuccessResponse(res, 200, "Total SIPL Product amount fetched successfully", {
        fromDate,
        toDate,
        totalAmount,
    });
});

// Get total open purchase orders
export const getOpenPOCountByClient = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = await purchaseOrderService.getOpenPOCountByClient(Number(clientId));

    return SuccessResponse(res, 200, "Open purchase order count fetched successfully.", data);
});

// Get total open SO
export const getOpenSOCountByClient = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = await salesOrderService.getOpenSOCountByClient(Number(clientId));

    return SuccessResponse(res, 200, "Open sales order count fetched successfully.", data);
});

// Get total open purchase orders
export const getPoInTransit = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = await purchaseOrderService.getPoInTransit(Number(clientId));

    return SuccessResponse(res, 200, "Open purchase order count fetched successfully.", data);
});

// Get total open purchase orders
export const getTotalAndPaidCustomerAmount = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = {
        totalAmount: await salesOrderInvoiceService.getTotalAmountForClient(Number(clientId)),
        totalPaidAmount: await paymentService.getTotalAmountByPayeeTypeAndClientId("customer", Number(clientId)),
    }

    return SuccessResponse(res, 200, "Total customer amounts fetched successfully.", data);
});

// Get total open purchase orders
export const getTotalAndPaidVendorAmount = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const totalSiplProductAmount = await siplProductService.getTotalSIPLProductValueByClient(Number(clientId))
    const totalBillProductAmount = await billService.getTotalBillValueByClientId(Number(clientId))

    const data = {
        totalAmount: (totalSiplProductAmount) + totalBillProductAmount,
        totalPaidAmount: await paymentService.getTotalAmountByPayeeTypeAndClientId("vendor", Number(clientId)),
    }

    return SuccessResponse(res, 200, "Total customer amounts fetched successfully.", data);
});

// getTotalSlabMetricByCategory
export const getTotalSlabMetricByCategory = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    const data = await productCategoryService.getTotalSlabMetricByCategory(Number(clientId));

    return SuccessResponse(res, 200, "Total slab metric by category fetched successfully.", data);
});