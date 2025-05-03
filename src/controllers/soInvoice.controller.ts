import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as salesOrderInvoiceService from "../services/salesOrderInvoice.service"

// Get all po with pagination.
export const getAllSoInvoiceList = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, ...filter }: any = req.query;

    const clientId = req.user?.clientId;

    const result = await salesOrderInvoiceService.getAllSoInvoiceList(Number(clientId), filter, page, limit);

    SuccessResponse(res, 200, "All So Invoice List fetched successfully", result.rows, {
        limit,
        page,
        total: result.count
    });
});