import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as ledgerAccountService from "../services/ledgerAccount.service";

// Create ledger account.
export const createLedgerAccount = catchAsync(async (req, res) => {
  const ledgerAccount = await ledgerAccountService.createLedgerAccount(req.body);
  return SuccessResponse(res, 201, "Ledger Account created successfully", ledgerAccount);
});

// Get all ledger accounts.
export const getLedgerAccounts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  const result = await ledgerAccountService.getLedgerAccounts(Number(page), Number(limit), filters);

  return SuccessResponse(res, 200, "Ledger Account list fetched successfully", result.rows, {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
  });
});

// Get ledger account by ID.
export const getLedgerAccountById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ledgerAccount = await ledgerAccountService.getLedgerAccountById(Number(id));
  return SuccessResponse(res, 200, "Ledger Account details fetched", ledgerAccount);
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
