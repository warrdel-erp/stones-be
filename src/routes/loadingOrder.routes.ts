import { Router } from "express";
import * as loadingOrderController from "../controllers/loadingOrder.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create new LO
router.post("/", authenticateUser, loadingOrderController.createLoadingOrder);

// Get all LO
router.get("/", authenticateUser, loadingOrderController.getAllLoadingOrders);

// Get loading order by Id
router.get("/:id", authenticateUser, loadingOrderController.getLoadingOrderById);

// Update Loading Order
router.put("/:id", authenticateUser, loadingOrderController.updateLoadingOrder);

export default router;
