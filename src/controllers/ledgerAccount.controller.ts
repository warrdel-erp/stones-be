import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as ledgerAccountService from "../services/ledgerAccount.service";
import * as ledgerAccountBulkUploadService from "../services/ledgerAccountBulkUpload.service";
import { AppError } from "../helper/appError";

// Create ledger account.
export const createLedgerAccount = catchAsync(async (req, res) => {
  const ledgerAccount = await ledgerAccountService.createLedgerAccount(req.body);
  return SuccessResponse(res, 201, "Ledger Account created successfully", ledgerAccount);
});

// Get all ledger accounts.
export const getLedgerAccounts = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  const clientId = req.user?.clientId

  const result = await ledgerAccountService.getLedgerAccounts(Number(page), Number(limit), Number(clientId), filters);

  return SuccessResponse(res, 200, "Ledger Account list fetched successfully", result.rows, {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
  });
});

// Get all ledger accounts.
export const getLedgerAccountsWithoutPagination = catchAsync(async (req, res) => {
  const { ...filters } = req.query;

  const result = await ledgerAccountService.getLedgerAccountsWithoutPagination(filters);
  return SuccessResponse(res, 200, "Ledger Account list fetched successfully without pagination", result);
});

// Get ledger account by ID.
export const getLedgerAccountById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ledgerAccount = await ledgerAccountService.getLedgerAccountById(Number(id));
  return SuccessResponse(res, 200, "Ledger Account details fetched", ledgerAccount);
});

export const getLedgerAccountsForFreightItems = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const ledgerAccount = await ledgerAccountService.getLedgerAccountsForFreightItems(Number(clientId));
  return SuccessResponse(res, 200, "Ledger Accounts for freightItems", ledgerAccount);
});

export const getDefaultLedgerAccountsForProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const ledgerAccounts = await ledgerAccountService.getDefaultLedgerAccountsForProduct(Number(clientId));
  return SuccessResponse(res, 200, "Default ledger accounts for product fetched successfully", ledgerAccounts);
});

// export const updateLedgerAccount = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const updatedLedgerAccount = await ledgerAccountService.updateLedgerAccount(Number(id), req.body);
//   return SuccessResponse(res, 200, "Ledger Account updated successfully", updatedLedgerAccount);
// });

// export const deleteLedgerAccount = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   await ledgerAccountService.deleteLedgerAccount(Number(id));
//   return SuccessResponse(res, 200, "Ledger Account deleted successfully", null);
// });

// Bulk upload ledger accounts.
export const bulkUploadLedgerAccounts = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  if (!req.file) {
    throw new AppError("File is required.", 400);
  }

  const result = await ledgerAccountBulkUploadService.bulkUploadLedgerAccounts(req.file.buffer, userId!, clientId!);
  return SuccessResponse(res, 200, "Ledger accounts uploaded successfully", result);
});
