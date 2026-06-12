import { Router } from "express";
import * as poController from "../controllers/purchaseOrder.controller";
import * as requestedPurchaseProductController from "../controllers/requestedPurchaseProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateUser)

// Create new PO
router.post("/", poController.createPurchaseOrderController);

// get all po list
router.get("/", poController.getAllPurchaseOrders);

// Get new PO number
router.get("/newPoNumber", poController.getNewPoNumber);

// get one PO detail according to ID
router.get("/:id", poController.getPurchaseOrderById);

// Get all SIPLs for a PO.
router.get("/:purchaseOrderId/sipls", poController.getSIPLsByPO);

// Update requested purchase product
router.put("/:purchaseOrderId/requestedPurchaseProduct", requestedPurchaseProductController.upsertRequestedPurchaseProducts);

// update po status.
router.patch("/:id/status", poController.updatePurchaseOrderStatus);

// Cancel Purchase Order
router.put("/:id/cancel", poController.cancelPurchaseOrderController);

// Add Requested Product
router.post("/:id/requested-product", poController.addRequestedProductController);

export default router;
