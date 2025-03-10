import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as notesService from "../services/notes.service";
import { SuccessResponse } from "../helper/response";

export const getNotes = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, ...filters } = req.query;

  const data = await notesService.fetchNotes(filters, Number(page), Number(limit));

  return SuccessResponse(res, 200, "Notes fetched successfully", data.notes, {
    limit: Number(limit),
    page: Number(page),
    total: data.total,
  });
});
