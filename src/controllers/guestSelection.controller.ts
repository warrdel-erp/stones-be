import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as guestSelectionService from "../services/guestSelection.service";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Public Handler: Get Client details by QR Code
 */
export const getClientByQrHandler = catchAsync(async (req: Request, res: Response) => {
  const { qrCode } = req.params;
  const client = await guestSelectionService.getClientDetailsByQrCode(qrCode);
  SuccessResponse(res, 200, "Client details retrieved successfully", client);
});

/**
 * Public Handler: Get Inventory Product details by QR Code
 */
export const getInventoryProductByQrHandler = catchAsync(async (req: Request, res: Response) => {
  const { qrCode } = req.params;
  const product = await guestSelectionService.getInventoryProductDetailsByQrCode(qrCode);
  SuccessResponse(res, 200, "Inventory Product details retrieved successfully", product);
});

/**
 * Public Handler: Submit Guest Selection List
 */
export const submitGuestSelectionHandler = catchAsync(async (req: Request, res: Response) => {
  const selection = await guestSelectionService.submitGuestSelection(req.body);
  SuccessResponse(res, 201, "Guest selection submitted successfully", selection);
});

/**
 * Authenticated Handler: Get Guest Selections for logged in client
 */
export const getGuestSelectionsHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { page = 1, limit = 10, search } = req.query;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID not found" });
  }

  const result = await guestSelectionService.getGuestSelections(
    clientId,
    Number(page),
    Number(limit),
    search as string
  );

  SuccessResponse(res, 200, "Guest selections retrieved successfully", result.data, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * Authenticated Handler: Get Guest Selection by ID
 */
export const getGuestSelectionByIdHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { id } = req.params;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID not found" });
  }

  const selection = await guestSelectionService.getGuestSelectionById(Number(id), clientId);
  SuccessResponse(res, 200, "Guest selection fetched successfully", selection);
});

/**
 * Authenticated Handler: Delete Guest Selection
 */
export const deleteGuestSelectionHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { id } = req.params;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID not found" });
  }

  await guestSelectionService.deleteGuestSelection(Number(id), clientId);
  SuccessResponse(res, 200, "Guest selection deleted successfully", null);
});

/**
 * Authenticated Handler: Update Guest Selection Status
 */
export const updateGuestSelectionStatusHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const { id } = req.params;
  const { status } = req.body;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID not found" });
  }

  await guestSelectionService.updateGuestSelectionStatus(Number(id), clientId, status);
  SuccessResponse(res, 200, "Guest selection status updated successfully", null);
});
