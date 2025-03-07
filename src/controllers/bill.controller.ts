import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as billService from "../services/bill.service";
import { AuthRequest } from "../middleware/authMiddleware";

export const createBill = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const bill = await billService.createBill({ ...req.body, createdBy: userId });
  SuccessResponse(res, 201, "Bill created Successfully", bill);
});

export const getAllBills = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, ...filter } = req.query;
  const bills = await billService.getAllBills(Number(page), Number(limit), filter);
  SuccessResponse(res, 200, "Bills fetched successfully", bills);
});

export const getBillById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bill = await billService.getOneBill(Number(id));
  SuccessResponse(res, 200, "Bill fetched successfully", bill);
});
