import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as salesOrderInvoiceService from "../services/salesOrderInvoice.service"
import { AppError } from "../helper/appError";

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

// Assign Truck to SO invoice.
export const assignTruck = catchAsync(async (req: AuthRequest, res: Response) => {

    const { id } = req.params;
    const truckId = req.body.truckId;

    if (!truckId) {
        throw new AppError("truckId is required.", 400);
    }

    const result = await salesOrderInvoiceService.assignTruck(Number(id), truckId);

    SuccessResponse(res, 200, "Truck assigned successfully", result);
});
