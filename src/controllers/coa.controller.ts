import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as coaService from "../services/coa.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

export const getCoaData = catchAsync(async (req: Request, res: Response) => {

  const { nested } = req.query

  let data;
  if (!!Number(nested)) {
    data = coaService.buildNestedCOA();
  } else {
    data = coaService.getCoaData();
  }

  SuccessResponse(res, 200, "Accounts data fetched successfully", data);
});

export const getBalanceSheetData = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  if (!clientId) {
    return res.status(400).json({ message: "Client ID is required" });
  }

  const data = await coaService.getBalanceSheetData(clientId);

  SuccessResponse(res, 200, "Balance sheet data fetched successfully", data);
});
