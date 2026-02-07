import { Request, Response } from "express";
import * as vendorService from "../services/vendor.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../helper/appError";

//  Controller to handle vendor creation.
export const createVendorController = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendorData = req.body;
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  // Call service function
  const newVendor = await vendorService.registerVendor({ ...vendorData, createdBy: userId }, Number(clientId));

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

// Get vendor by ID
export const getVendorById = catchAsync(async (req: Request, res: Response) => {
  const vendorId = parseInt(req.params.id);
  const vendor = await vendorService.getVendorById(vendorId);

  SuccessResponse(res, 200, "Vendor fetched successfully", vendor);
});

export const vendorAccordingToSIPL = catchAsync(async (req: Request, res: Response) => {
  const { siplId } = req.params;

  const data = await vendorService.vendorAccordingToSIPL(Number(siplId));
  SuccessResponse(res, 200, "vendors according to SIPL fetched successfully", data);
});

export const getAllBillsForVendor = catchAsync(async (req: Request, res: Response) => {
  const { vendorId } = req.params;
  const bills = await vendorService.getAllBillsForVendor(Number(vendorId));

  SuccessResponse(res, 200, "Bills fetched successfully", bills);
});

// Bulk upload vendors via CSV
export const bulkUploadVendors = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  if (!req.file) {
    throw new AppError("CSV file is required.", 400);
  }

  const result = await vendorService.bulkUploadVendors(req.file.buffer, userId!, clientId!);

  SuccessResponse(res, 201, "Vendors uploaded successfully", result);
});
