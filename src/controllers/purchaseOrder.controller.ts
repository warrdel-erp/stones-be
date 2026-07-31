import { Request, Response } from "express";
import { AppError } from "../helper/appError";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as poService from "../services/purchaseOrder.service";

/**
 * Controller to handle PO creation.
 */
export const createPurchaseOrderController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  const { locationId, shipmentLocationId, supplierId } = req.body;
  const { internalNote, printableNote } = req.body; // Extract notes separately

  // Validate required fields
  if (!locationId || !shipmentLocationId || !supplierId) {
    throw new AppError("Missing required fields: locationId, shipmentLocationId, supplierId", 400);
  }

  const notesData = { internal: internalNote, printable: printableNote };

  // Call service function
  const newPO = await poService.registerPurchaseOrder({ ...req.body, userId }, notesData);

  return SuccessResponse(res, 201, "Purchase Order created successfully.", newPO);
});

// Get all po with pagination.
export const getAllPurchaseOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, ...filter }: any = req.query;

  const clientId = req.user?.clientId;

  const result = await poService.getAllPurchaseOrders(Number(page), Number(limit), Number(clientId), filter);
  SuccessResponse(res, 200, "Purchase Orders fetched successfully", result.data, {
    limit: result.pagination.limit,
    page: result.pagination.page,
    total: result.pagination.total,
  });
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

  SuccessResponse(res, 200, "Purchase Order fetched successfully", purchaseOrder);
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
export const getNewPoNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await poService.getPONumber(clientId!);
  SuccessResponse(res, 200, "New PO number fetched successfully.", data);
});

// 🔹 Update PurchaseOrder Status
export const updatePurchaseOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const purchaseOrderId = parseInt(req.params.id);
  const { status } = req.body;

  if (!purchaseOrderId) {
    throw new AppError("po id is required", 400);
  }

  if (!status) {
    throw new AppError("Status is required", 400);
  }

  const updatedPurchaseOrder = await poService.updatePurchaseOrderStatusService(purchaseOrderId, status);
  SuccessResponse(res, 200, "PurchaseOrder status updated successfully", updatedPurchaseOrder);
});

// Cancel a Purchase Order
export const cancelPurchaseOrderController = catchAsync(async (req: AuthRequest, res: Response) => {
  const purchaseOrderId = parseInt(req.params.id);
  const locationId = req.user?.defaultLocationId;
  const clientId = req.user?.clientId;

  if (!purchaseOrderId) {
    throw new AppError("Purchase Order ID is required", 400);
  }

  if (!locationId || !clientId) {
    throw new AppError("locationId and clientId are required", 400);
  }

  const result = await poService.cancelPurchaseOrderService(purchaseOrderId, Number(locationId), Number(clientId));
  SuccessResponse(res, 200, "Purchase Order canceled successfully", result);
});

// Add requested product to an existing PO
export const addRequestedProductController = catchAsync(async (req: AuthRequest, res: Response) => {
  const purchaseOrderId = parseInt(req.params.id);
  const { productId, quantity, unitPrice, noOfSlabs, description, supplierNote } = req.body;

  if (!purchaseOrderId) {
    throw new AppError("Purchase Order ID is required", 400);
  }
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }
  if (quantity === undefined || quantity === null) {
    throw new AppError("Quantity is required", 400);
  }
  if (unitPrice === undefined || unitPrice === null) {
    throw new AppError("Unit price is required", 400);
  }

  const newProduct = await poService.addRequestedProductToPOService(purchaseOrderId, {
    productId: Number(productId),
    quantity: Number(quantity),
    unitPrice: Number(unitPrice),
    noOfSlabs: noOfSlabs ? Number(noOfSlabs) : null,
    description: description || "",
    supplierNote: supplierNote || null,
  });

  return SuccessResponse(res, 201, "Product added to Purchase Order successfully.", newProduct);
});

// Update Purchase Order
export const updatePurchaseOrderController = catchAsync(async (req: AuthRequest, res: Response) => {
  const purchaseOrderId = parseInt(req.params.id);
  const { internalNote, printableNote } = req.body;
  const notesData = { internal: internalNote, printable: printableNote };

  if (!purchaseOrderId) {
    throw new AppError("Purchase Order ID is required", 400);
  }

  const updatedPO = await poService.updatePurchaseOrderService(purchaseOrderId, req.body, notesData);
  return SuccessResponse(res, 200, "Purchase Order updated successfully.", updatedPO);
});

