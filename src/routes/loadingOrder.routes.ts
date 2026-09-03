import { Router } from "express";
import * as loadingOrderController from "../controllers/loadingOrder.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create new LO
router.post("/", authenticateUser, loadingOrderController.createLoadingOrder);

// Get all PL
router.get("/", authenticateUser, loadingOrderController.getAllLoadingOrders);

// Get new SO number.
router.get("/newLoNumber", authenticateUser, loadingOrderController.getNewPlNumber);

// Update Loading Order
router.put("/:id", authenticateUser, loadingOrderController.updateLoadingOrder);

// Get Loading Order by Id
router.get("/:id", authenticateUser, loadingOrderController.getLoadingOrderById);

// Invoice Loading Order
router.post("/:id/invoice", authenticateUser, loadingOrderController.invoiceLoadingOrder);

export default router;
