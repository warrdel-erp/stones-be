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
