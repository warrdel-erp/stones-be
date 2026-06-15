import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import * as invoiceService from "../services/customerExternalInvoice.service";

export const bulkUploadInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError("Please upload a CSV or Excel file", 400);
  }

  const clientId = req.user?.clientId;
  if (!clientId) {
    throw new AppError("Client ID not found in user token", 401);
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("User ID not found in user token", 401);
  }

  const result = await invoiceService.bulkUploadCustomerExternalInvoices(req.file.buffer, clientId, userId);

  SuccessResponse(res, 201, "Invoices uploaded successfully", result);
});

export const getAllInvoicesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, ...filters } = req.query;
  const clientId = req.user?.clientId;

  if (!clientId) {
    throw new AppError("Client ID not found in user token", 401);
  }

  const result = await invoiceService.fetchAllCustomerExternalInvoices(
    Number(page),
    Number(limit),
    Number(clientId),
    search ? String(search) : undefined,
    filters
  );

  return SuccessResponse(res, 200, "Invoices retrieved successfully", result.transactions, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});
