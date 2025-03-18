import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";

import * as vendorService from "../services/vendor.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

// Get all vendor list
export const getVendorList = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const vendors = await vendorService.getVendorsForMaster(Number(clientId));
  return SuccessResponse(res, 200, "Vendor list fetched successfully", vendors);
});
