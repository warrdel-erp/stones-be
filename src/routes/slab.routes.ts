import { Router } from "express";
import * as slabController from "../controllers/slab.controller";

import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// hold-unHold slab
router.put("/:slabId/hold", authenticateUser, slabController.updateSlabHoldStatus);

// put and remove slab to cart
router.put("/:slabId/cart", authenticateUser, slabController.updateSlabCartStatus);

// Bulk update slabs
router.put("/bulkUpdate", authenticateUser, slabController.bulkUpdateSlabs);

// Update slab
router.put("/:slabId", authenticateUser, slabController.updateSlab);

// Create a new Remeasurement
router.post("/:slabId/remeasure", authenticateUser, slabController.createSlabLog);

// Get all slabs with filter
router.get("/", authenticateUser, slabController.getAllSlabs);

// // Get all remeasurement by Slab id.
router.get("/:slabId", authenticateUser, slabController.getSlabWithLogs);

// get cart count
router.get("/cart/count", authenticateUser, slabController.getCartCount);

export default router;
