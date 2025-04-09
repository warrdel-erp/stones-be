import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import { SuccessResponse } from "../helper/response";
import * as journalEntryService from "../services/journalEntry.service";

// get journal entries with filters
export const getJournalEntries = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const filters = req.query;

  const entries = await journalEntryService.getAllJournalEntries(filters, Number(clientId));
  SuccessResponse(res, 200, "Fetched journal entries", entries);
});

// Create journal entry
export const createJournalEntry = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const entries = await journalEntryService.createJournalEntry({ ...req.body, createdBy: userId });
  SuccessResponse(res, 200, "Fetched journal entries", entries);
});
