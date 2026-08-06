import { Router } from "express";
import * as siplController from "../controllers/sipl.controller";
import {
  extractSiplPdfController,
  getTempExtractedItemsController,
  updateTempExtractedItemsController,
  confirmTempExtractedItemsController,
} from "../controllers/aiExtraction.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// --- AI Extraction Routes ---
router.post("/:siplId/extract-from-pdf", authenticateUser, extractSiplPdfController);
router.get("/:siplId/temp-items", authenticateUser, getTempExtractedItemsController);
router.put("/temp-items/:tempId", authenticateUser, updateTempExtractedItemsController);
router.post("/:siplId/confirm-temp-items", authenticateUser, confirmTempExtractedItemsController);


// Receive all slabs in an SIPL in inventory.
router.put("/:id/receiveInventory", authenticateUser, siplController.receiveInventoryController);

// Cancel an SIPL
router.put("/:id/cancel", authenticateUser, siplController.cancelSIPLController);

// Create SIPL against PO.
router.post("/createSipl", authenticateUser, siplController.createSIPLController);

// Create SIPL against PO.
router.post("/createDirectSipl", authenticateUser, siplController.createDirectSIPLController);

// Get new PO number
router.get("/newInvoiceNumber", authenticateUser, siplController.getNewInvoiceNumber);

// get SIPL by ID
router.get("/:id/getReceiveInventoryData", authenticateUser, siplController.getReceiveInventoryData);

// Add container to SIPL
router.post("/:id/addContainer", authenticateUser, siplController.addContainer);

// Get all containers of a SIPL
router.get("/:id/containers", authenticateUser, siplController.getSIPLContainers);

// Get all barcode
router.get("/:siplId/barcode", authenticateUser, siplController.getAllBarcode);

// Get all QR codes
router.get("/:siplId/qrcodes", authenticateUser, siplController.getAllQrCodes);

// Get new combined slab number
router.get('/:siplId/newCombinedSlabNumber', authenticateUser, siplController.getNewCombinedSlabNumberController);

// get SIPL by id with less data
router.get("/:id/less", authenticateUser, siplController.getSIPLBySlabIdSimple);

// add slab to SIPL.
router.post("/:siplId/addSlab", authenticateUser, siplController.createSlabHandler);

// get all SIPLs
router.get("/", authenticateUser, siplController.getAllSIPLs);

// get overdue SIPLs by vendor
router.get("/overdue/vendor/:vendorId", authenticateUser, siplController.getOverdueSIPLsByVendorController);

// get SIPL by ID
router.get("/:id", authenticateUser, siplController.getSIPLById);

export default router;
