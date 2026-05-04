import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import * as externalTransactionService from "../services/externalCustomerTransaction.service";

export const bulkUploadTransactions = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError("Please upload a CSV file", 400);
  }

  const clientId = req.user?.clientId;
  if (!clientId) {
    throw new AppError("Client ID not found in user token", 401);
  }

  const result = await externalTransactionService.bulkUploadExternalTransactions(req.file.buffer, clientId);

  SuccessResponse(res, 201, "Transactions uploaded successfully", result);
});

export const getAllTransactionsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, ...filters } = req.query;
  const clientId = req.user?.clientId;

  if (!clientId) {
    throw new AppError("Client ID not found in user token", 401);
  }

  const result = await externalTransactionService.fetchAllExternalTransactions(
    Number(page),
    Number(limit),
    Number(clientId),
    search ? String(search) : undefined,
    filters
  );

  return SuccessResponse(res, 200, "Transactions retrieved successfully", result.transactions, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});
