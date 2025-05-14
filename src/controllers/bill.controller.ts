import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as billService from "../services/bill.service";
import { AuthRequest } from "../middleware/authMiddleware";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import * as siplRepository from "../repositories/sipl.repository";
import { AppError } from "../helper/appError";

export const createBill = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;
  const locationId = req.user?.defaultLocationId;

  // check if SIPL if received in inventory or not.
  if (req.body.referenceType === BILL_REFERENCE_TYPES.SIPL) {
    const sipl = await siplRepository.findSIPLByIdSimple(req.body.referenceId);
    if (sipl?.get("inventoryReceived")) {
      throw new AppError("Can't create a bill for a received inventory SIPL", 400);
    }
  }

  const bill = await billService.createBill({ ...req.body, createdBy: userId, clientId, }, Number(locationId));
  SuccessResponse(res, 201, "Bill created Successfully", bill);
});

export const getAllBills = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, ...filter } = req.query;
  const bills = await billService.getAllBills(Number(page), Number(limit), filter);
  SuccessResponse(res, 200, "Bills fetched successfully", bills.data, {
    total: bills.total,
    page: bills.page,
    limit: bills.limit
  });
});

export const getBillById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bill = await billService.getOneBill(Number(id));
  SuccessResponse(res, 200, "Bill fetched successfully", bill);
});

// Get new Bill number
export const getNewBillNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await billService.getBillNumber(clientId!);
  SuccessResponse(res, 200, "New Bill number fetched successfully.", data);
});

// Get new Bill number
export const getLastBillAsPerSIPL = catchAsync(async (req: AuthRequest, res: Response) => {
  const { siplId } = req.params;

  const data = await billService.getLastBillAsPerSIPL(Number(siplId));
  SuccessResponse(res, 200, "Last bill as per SIPL fetched successfully.", data);
});
