import { Router } from "express";
import * as salesOrderController from "../controllers/salesOrder.controller";
import * as loadingOrderController from "../controllers/loadingOrder.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new SO
router.post("/", authenticateUser, salesOrderController.createSalesOrder);

// Get All SO
router.get("/", authenticateUser, salesOrderController.getAllSalesOrders);

// Get loading order by SO id
router.get("/:salesOrderId/loadingOrder", authenticateUser, loadingOrderController.getLoadingOrdersBySalesOrderId);

// Get SO by Id
router.get("/:id", authenticateUser, salesOrderController.getSalesOrderById);

export default router;
