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

// add slab to SIPL.
router.post("/:id/addSlab", authenticateUser, siplController.createSlabHandler);

export default router;
