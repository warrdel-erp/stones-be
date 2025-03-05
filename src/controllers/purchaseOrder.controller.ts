import { Request, Response } from "express";
import * as poService from "../services/purchaseOrder.service";
import { AppError } from "../helper/appError";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as siplService from "../services/sipl.service";

/**
 * Controller to handle PO creation.
 */
export const createPurchaseOrderController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  const { purchaseLocationId, shipmentLocationId, supplierId } = req.body;
  const { internalNote, printableNote } = req.body; // Extract notes separately

  // Validate required fields
  if (!purchaseLocationId || !shipmentLocationId || !supplierId) {
    throw new AppError("Missing required fields: purchaseLocationId, shipmentLocationId, supplierId", 400);
  }

  const notesData = { internal: internalNote, printable: printableNote };

  // Call service function
  const newPO = await poService.registerPurchaseOrder({ ...req.body, userId, clientId }, notesData);

  return SuccessResponse(res, 201, "Purchase Order created successfully.", newPO);
});

// Get all po with pagination.
export const getAllPurchaseOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await poService.getAllPurchaseOrders(page, limit);
  SuccessResponse(res, 200, "Purchase Orders fetched successfully", result);
});

// get PO detail by id
export const getPurchaseOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Get PO ID from URL parameters
  if (!id) {
    throw new AppError("Purchase Order ID is required", 400);
  }

  // Fetch PO details via service
  const purchaseOrder = await poService.getPurchaseOrderById(Number(id));

  // find all products added in a PO
  // get sum of all SIPL products that belongs to given product and purchaseOrder

  if (!purchaseOrder) {
    throw new AppError("Purchase Order not found", 404);
  }

  return res.status(200).json(purchaseOrder);
});

// Get all SIPLs for a PO.
export const getSIPLsByPO = catchAsync(async (req: Request, res: Response) => {
  const purchaseOrderId = Number(req.params?.purchaseOrderId);
  if (!purchaseOrderId) {
    throw new AppError("Purchase Order ID is required", 400);
  }

  const sipls = await poService.getSIPLsForPurchaseOrder(purchaseOrderId);
  SuccessResponse(res, 200, "SIPL list fetched successfully.", sipls);
});

// Get new PO number
export const getNewPoNumber = catchAsync(async (req: Request, res: Response) => {
  const data = await poService.getPONumber();
  SuccessResponse(res, 200, "New PO number fetched successfully.", data);
});
