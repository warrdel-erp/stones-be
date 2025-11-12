import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as salesOrderProductController from "../controllers/salesOrderProduct.controller";

const router = express.Router();

// hold-unHold slab
router.put("/:soProductId/pick", authenticateUser, salesOrderProductController.updateSoProductPickedStatus);

// swap
router.put("/:soProductId/swap", authenticateUser, salesOrderProductController.swapSalesOrderProduct);

// get swap history
router.get("/:soProductId/swap-history", authenticateUser, salesOrderProductController.getSwapHistory);

export default router;
