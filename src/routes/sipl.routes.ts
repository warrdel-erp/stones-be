import { Router } from "express";
import * as siplController from "../controllers/sipl.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Receive all slabs in an SIPL in inventory.
router.put("/:id/receiveInventory", authenticateUser, siplController.receiveInventoryController);

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

// Add all barcode
router.get("/:siplId/barcode", authenticateUser, siplController.getAllBarcode);

// Get new combined slab number
router.get('/:siplId/newCombinedSlabNumber', authenticateUser, siplController.getNewCombinedSlabNumberController);

// get SIPL by ID
router.get("/:id", authenticateUser, siplController.getSIPLById);

// get SIPL by id with less data
router.get("/:id/less", authenticateUser, siplController.getSIPLBySlabIdSimple);

// add slab to SIPL.
router.post("/:siplId/addSlab", authenticateUser, siplController.createSlabHandler);

// get all SIPLs
router.get("/", authenticateUser, siplController.getAllSIPLs);

export default router;
