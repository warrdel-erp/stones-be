import { Request, Response } from "express";
import * as vendorService from "../services/vendor.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

//  Controller to handle vendor creation.
export const createVendorController = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendorData = req.body;
  const userId = req.user?.id;

  // Call service function
  const newVendor = await vendorService.registerVendor({ ...vendorData, createdBy: userId });

  return SuccessResponse(res, 201, "Vendor created successfully.", newVendor);
});

// Update Vendor
export const updateVendorController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const updatedVendor = await vendorService.updateVendor(Number(id), data);
  return SuccessResponse(res, 200, "Vendor updated successfully", updatedVendor);
});

// Get all vendors
export const getAllVendorsController = catchAsync(async (req: Request, res: Response) => {
  let { page, limit, ...filter }: any = req.query;

  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const result = await vendorService.fetchAllVendors(page, limit, filter);

  return SuccessResponse(res, 200, "Vendors retrieved successfully", result.vendors, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});
