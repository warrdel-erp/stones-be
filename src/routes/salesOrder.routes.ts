import { Router } from "express";
import * as salesOrderController from "../controllers/salesOrder.controller";
import * as loadingOrderController from "../controllers/loadingOrder.controller";
import * as salesOrderProductController from "../controllers/salesOrderProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new SO
router.post("/", authenticateUser, salesOrderController.createSalesOrder);

// Get All SO
router.get("/", authenticateUser, salesOrderController.getAllSalesOrders);

// Get loading order by SO id
router.get("/:salesOrderId/loadingOrder", authenticateUser, loadingOrderController.getLoadingOrdersBySalesOrderId);

// Update requested sales order product
router.put("/salesOrderProducts/bulk", authenticateUser, salesOrderProductController.updateSalesOrderProducts);

// Get new SO number
router.get("/newSoNumber", authenticateUser, salesOrderController.getNewSoNumber);

// Get Paid Amount for a SO
router.get("/paidAmount/:id", authenticateUser, salesOrderController.getPaidAmountForSO)

// Get SO by Id for Create LO
router.get("/:id/forCreateLO", authenticateUser, salesOrderController.getSalesOrderByIdForCreateLO);

// Get SO by Id
router.get("/:id", authenticateUser, salesOrderController.getSalesOrderById);

export default router;
