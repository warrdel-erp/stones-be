import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as billService from "../services/bill.service";

export const createBill = catchAsync(async (req: Request, res: Response) => {
  const bill = await billService.createBill(req.body);
  SuccessResponse(res, 201, "Bill created Successfully", bill);
});
