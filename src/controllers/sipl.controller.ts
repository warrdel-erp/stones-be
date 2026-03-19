import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as siplService from "../services/sipl.service";
import * as poService from "../services/purchaseOrder.service";
import * as siplProductService from "../services/siplProduct.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import { sequelize } from "../config/database";

// Controller to handle receiving inventory (updating slabs to IN_INVENTORY).
export const receiveInventoryController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // Get SIPL ID from request parameters

  const clientId = req.user?.clientId; // Get client ID from request
  const locationId = req.user?.defaultLocationId;
  const receivedDate = req.body.receivedDate;

  if (!receivedDate) {
    throw new AppError("Received date is required.", 400);
  }

  if (!id) {
    throw new AppError("SIPL ID is required.", 400);
  }

  const updatedCount = await siplService.receiveInventory(Number(id), receivedDate, clientId!, Number(locationId));

  if (updatedCount === 0) {
    throw new AppError("No slabs found or already in inventory.", 404);
  }

  SuccessResponse(res, 200, `Successfully updated ${updatedCount} slabs to IN_INVENTORY.`, updatedCount);
});

// Create SIPL
export const createSIPLController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const clientId = req.user?.clientId;
  const locationId = req.user?.defaultLocationId;

  const data = {
    ...req.body,
    clientId: clientId,
    createdBy: userId,
    updatedBy: userId,
  };

  const sipl = await siplService.createSIPLService(data, Number(locationId));
  res.status(201).json({ success: true, data: sipl });
});

export const addContainer = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user?.clientId;

  if (!clientId) {
    throw new AppError("Client ID is required.", 400);
  }

  const container = await siplService.addContainer(req.body, Number(id), clientId);
  SuccessResponse(res, 201, "Container added successfully", container);
});

// Get all barcode
export const getAllBarcode = catchAsync(async (req: Request, res: Response) => {
  const { siplId } = req.params;

  const container = await siplService.getAllBarcode(Number(siplId));
  SuccessResponse(res, 201, "Barcode fetched successfully", container);
});

/**
 * create Direct SIPL meaning (first create PO)
 * 1. create PO
 * 2. create SIPL with PO data
 */
export const createDirectSIPLController = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    poDate,
    locationId,
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
    etaDate,
    expiryDate,
    dueDate,
    shipDate,
    paymentTermId,
    services
  } = req.body;
  const { internalNote, printableNote } = req.body; // Extract notes separately

  const createdBy = req.user?.id; // Get user ID from request
  const clientId = req.user?.clientId;
  const userLocationId = req.user?.defaultLocationId;

  // There is problem in adding transaction that sipl product needs id of requestedProductId but it is not been created

  const transaction = await sequelize.transaction();

  try {
    // Validate required fields
    if (
      !poDate ||
      !locationId ||
      !shipmentLocationId ||
      !supplierId ||
      !products ||
      !freightDetail ||
      !clientInvoiceDate ||
      !supplierInvoiceNumber ||
      !supplierInvoiceDate ||
      !shipDate ||
      !dueDate
    ) {
      throw new AppError(
        "Missing required fields: poDate, supplierInvoiceDate,  supplierInvoiceNumber, locationId, shipmentLocationId, supplierId, clientInvoiceDate, dueDate, shipDate",
        400
      );
    }

    const poData = {
      poDate,
      locationId,
      shipmentLocationId,
      supplierId,
      userId,
      products,
      freightDetail,
      clientId,
      etaDate,
      container,
      expiryDate,
      paymentTermId
    };

    const notesData = { internal: internalNote, printable: printableNote };

    // Call service function
    const newPO = await poService.registerPurchaseOrder(poData, notesData, transaction);

    // Set products payload as function expect.
    newPO.requestedPurchaseProduct = newPO.requestedPurchaseProduct.map((e: any) => {
      const { id, ...plain } = e.get({ plain: true });

      return {
        ...plain,
        requestedPurchaseProductId: id,
      };
    });

    const siplData = {
      purchaseOrderId: newPO.id,
      clientId,
      products: newPO.requestedPurchaseProduct,
      freightDetail,
      description,
      supplierNotes,
      createdBy,
      container,
      clientInvoiceDate,
      supplierInvoiceNumber,
      supplierInvoiceDate,
      updatedBy: createdBy,
      locationId,
      shipmentLocationId,
      dueDate,
      shipDate,
      services,
      paymentTermId
    };

    const sipl = await siplService.createSIPLService(siplData, Number(userLocationId), transaction);

    transaction.commit();
    SuccessResponse(res, 201, "SIPL with PO is been created successfully", { sipl, newPO });
  } catch (error) {
    transaction.rollback();
    throw error;
  }
});

// Create slabs for SIPL
export const createSlabHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const { siplId } = req.params;
  const userId = req.user?.id;
  const clientId = req.user?.clientId

  const { siplProductId, productId } = req.body;

  if (!siplProductId) {
    throw new AppError("siplProductId is required.", 400);
  }

  const siplProduct: any = await siplProductService.findSiplProductByProductId(
    siplProductId,
    productId,
    Number(siplId)
  );

  if (!siplProduct) {
    throw new AppError(
      `Either SIPL product '${siplProductId}' does not exists, or it does not belongs to given product '${productId}' or SIPL '${siplId}'`,
      400
    );
  }

  const payload = {
    ...req.body,
    binId: req.body.binId ?? null,
    siplId: Number(siplId),
    createdById: userId,
    updatedById: userId,
    clientId
  };

  if (!siplProduct.requestedPurchaseProduct.product.isSlabType) {
    const genericProduct = await siplService.handleCreateGenericProduct({
      ...payload
    });
    return SuccessResponse(res, 201, "Generic product created successfully", genericProduct);
  }

  const slabs = await siplService.handleCreateSlabs({
    ...payload
  });

  SuccessResponse(res, 201, "Slabs created successfully", slabs);
});

// Get new PO number
export const getNewInvoiceNumber = catchAsync(async (req: Request, res: Response) => {
  const data = await siplService.getInvoiceNumber();
  SuccessResponse(res, 200, "New invoice number fetched successfully.", data);
});

// Get SIPL by ID
export const getSIPLById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sipl = await siplService.getSIPLById(Number(id));

  SuccessResponse(res, 200, "SIPL fetched successfully", sipl);
});

// Get all SIPLs
export const getAllSIPLs = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const clientId = req.user?.clientId

  const sipls = await siplService.getAllSIPLs(Number(page), Number(limit), Number(clientId));
  SuccessResponse(res, 200, "SIPLs fetched successfully", sipls.data, {
    page: sipls.page,
    limit: sipls.limit,
    total: sipls.total
  });
});

// Get all SIPLs
export const getReceiveInventoryData = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sipls = await siplService.getSiplCalculations(Number(id));

  SuccessResponse(res, 200, "Inventory data fetched successfully", sipls);
});

// Get new combined slab number
export const getNewCombinedSlabNumberController = catchAsync(async (req: Request, res: Response) => {
  const { siplId } = req.params;

  if (!siplId) {
    throw new AppError("SIPL ID is required.", 400);
  }

  const newCombinedSlabNumber = await siplService.getNewCombinedSlabNumberService(Number(siplId));

  SuccessResponse(res, 200, "New combined slab number fetched successfully.", newCombinedSlabNumber);
});

// Get SIPL by Slab ID
export const getSIPLBySlabIdSimple = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("SIPL ID is required.", 400);
  }

  const sipl = await siplService.getSIPLByIdSimple(Number(id));

  SuccessResponse(res, 200, "SIPL fetched successfully", sipl);
});

// Get all containers of a SIPL
export const getSIPLContainers = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("SIPL ID is required.", 400);
  }

  const containers = await siplService.getSIPLContainers(Number(id));

  SuccessResponse(res, 200, "Containers fetched successfully", containers);
});