import { Router } from "express";
import * as loadingOrderController from "../controllers/loadingOrder.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import * as loadingOrderProductController from "../controllers/loadingOrderProduct.controller";

const router = Router();

// Create new LO.
router.post("/", authenticateUser, loadingOrderController.createLoadingOrder);

// Get all LO.
router.get("/", authenticateUser, loadingOrderController.getAllLoadingOrders);

// Update Loading Order.
router.put("/:id", authenticateUser, loadingOrderController.updateLoadingOrder);

// Update requested loading order product.
router.put(
  "/:loadingOrderId/loadingOrderProduct",
  authenticateUser,
  loadingOrderProductController.upsertLoadingOrderProducts
);

// Update requested loading order product.
router.get(
  "/:loadingOrderId/loadingOrderProduct",
  authenticateUser,
  loadingOrderProductController.getLoadingOrderProducts
);

// Get new SO number.
router.get("/newLoNumber", authenticateUser, loadingOrderController.getNewLoNumber);

// Create invoice.
router.put("/:id/createInvoice", authenticateUser, loadingOrderController.invoiceLoadingOrder);

// Get loading order by Id
router.get("/:id", authenticateUser, loadingOrderController.getLoadingOrderById);

export default router;
