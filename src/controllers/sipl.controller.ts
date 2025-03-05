import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as siplService from "../services/sipl.service";
import * as poService from "../services/purchaseOrder.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Controller to handle receiving inventory (updating slabs to IN_INVENTORY).
 */
export const receiveInventoryController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // Get SIPL ID from request parameters

  if (!id) {
    throw new AppError("SIPL ID is required.", 400);
  }

  const updatedCount = await siplService.receiveInventory(Number(id));

  if (updatedCount === 0) {
    throw new AppError("No slabs found or already in inventory.", 404);
  }

  SuccessResponse(res, 200, `Successfully updated ${updatedCount} slabs to IN_INVENTORY.`, updatedCount);
});

// Create SIPL
export const createSIPLController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  const data = {
    ...req.body,
    clientId: clientId,
    createdBy: userId,
    updatedBy: userId,
  };

  const sipl = await siplService.createSIPLService(data);
  res.status(201).json({ success: true, data: sipl });
});

/**
 * create Direct SIPL meaning (first create PO)
 * 1. create PO
 * 2. create SIPL with PO data
 */

export const createDirectSIPLController = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    poDate,
    purchaseLocationId,
    shipmentLocationId,
    supplierId,
    userId,
    products,
    freightDetail,
    container,
    description,
    supplierNotes,
    clientInvoiceDate,
    supplierInvoiceNumber,
    supplierInvoiceDate,
  } = req.body;
  const { internalNote, printableNote } = req.body; // Extract notes separately

  const createdBy = req.user?.id; // Get user ID from request
  const clientId = req.user?.clientId;

  // Validate required fields
  if (
    !poDate ||
    !purchaseLocationId ||
    !shipmentLocationId ||
    !supplierId ||
    !products ||
    !freightDetail ||
    !clientInvoiceDate ||
    !supplierInvoiceNumber ||
    !supplierInvoiceDate
  ) {
    throw new AppError(
      "Missing required fields: poDate, supplierInvoiceDate,  supplierInvoiceNumber, purchaseLocationId, shipmentLocationId, supplierId, clientInvoiceDate",
      400
    );
  }

  const poData = {
    poDate,
    purchaseLocationId,
    shipmentLocationId,
    supplierId,
    userId,
    products,
    freightDetail,
    clientId,
  };

  const notesData = { internal: internalNote, printable: printableNote };

  // Call service function
  const newPO = await poService.registerPurchaseOrder(poData, notesData);

  const siplData = {
    purchaseOrderId: newPO.id,
    clientId,
    products,
    freightDetail,
    description,
    supplierNotes,
    createdBy,
    container,
    clientInvoiceDate,
    supplierInvoiceNumber,
    supplierInvoiceDate,
    updatedBy: createdBy,
  };

  const sipl = await siplService.createSIPLService(siplData);

  SuccessResponse(res, 201, "SIPL is been created successfully", { sipl, newPO });
});

// Create slabs for SIPL
export const createSlabHandler = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const slabs = await siplService.handleCreateSlabs({ ...req.body, siplId: id });
  res.status(201).json({ message: "Slabs created successfully", slabs });
});

// Get new PO number
export const getNewInvoiceNumber = catchAsync(async (req: Request, res: Response) => {
  const data = await siplService.getInvoiceNumber();
  SuccessResponse(res, 200, "New invoice number fetched successfully.", data);
});
