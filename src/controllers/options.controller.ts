import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as optionsService from "../services/options.service";

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
