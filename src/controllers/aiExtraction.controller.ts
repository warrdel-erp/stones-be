import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  processSiplPdfExtraction,
  getActiveTempExtractedItems,
  updateTempExtractedItemsDraft,
  confirmAndCreateSiplInventory
} from "../services/aiExtraction.service";

/**
 * Extract SIPL items from attached PDF via OpenAI AI service
 */
export const extractSiplPdfController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { siplId } = req.params;
    const clientId = req.user?.clientId;
    const locationId = req.user?.defaultLocationId;

    if (!siplId) {
      return res.status(400).json({ status: "error", message: "siplId is required." });
    }

    try {
      const result = await processSiplPdfExtraction(Number(siplId), Number(clientId), locationId);
      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in extractSiplPdfController:", error);
      const statusCode = error.message.includes("not found") || error.message.includes("No PDF") ? 404 : 500;
      return res.status(statusCode).json({ status: "error", message: error.message });
    }
  }
);

/**
 * Get active temporary extracted items for a SIPL
 */
export const getTempExtractedItemsController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { siplId } = req.params;
    const clientId = req.user?.clientId;

    const tempRecord: any = await getActiveTempExtractedItems(Number(siplId), Number(clientId));

    return res.status(200).json({
      status: "success",
      data: tempRecord ? { tempId: tempRecord.id, items: tempRecord.extractedData } : null,
    });
  }
);

/**
 * Update temporary extracted items draft
 */
export const updateTempExtractedItemsController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { tempId } = req.params;
    const { items } = req.body;
    const clientId = req.user?.clientId;

    try {
      const tempRecord = await updateTempExtractedItemsDraft(Number(tempId), Number(clientId), items);
      return res.status(200).json({
        status: "success",
        data: tempRecord,
      });
    } catch (error: any) {
      return res.status(404).json({ status: "error", message: error.message });
    }
  }
);

/**
 * Confirm temporary extracted items and create actual InventoryProducts & Slabs
 */
export const confirmTempExtractedItemsController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { siplId } = req.params;
    const { tempId, items } = req.body;
    const clientId = req.user?.clientId;
    const locationId = req.user?.defaultLocationId;

    try {
      const createdCount = await confirmAndCreateSiplInventory(
        Number(siplId),
        tempId ? Number(tempId) : undefined,
        items,
        Number(clientId),
        locationId
      );

      return res.status(200).json({
        status: "success",
        message: `Successfully created ${createdCount} inventory items.`,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("not found") || error.message.includes("No items") ? 400 : 500;
      return res.status(statusCode).json({ status: "error", message: error.message });
    }
  }
);
