import { Router } from "express";
import * as poController from "../controllers/purchaseOrder.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create new PO
router.post("/", poController.createPurchaseOrderController);

// get all po list
router.get("/", authenticateUser, poController.getAllPurchaseOrders);

// Get new PO number
router.get("/newPoNumber", poController.getNewPoNumber);

// get one PO detail according to ID
router.get("/:id", poController.getPurchaseOrderById);

// Get all SIPLs for a PO.
router.get("/:purchaseOrderId/sipls", poController.getSIPLsByPO);

export default router;
