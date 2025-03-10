import { Router } from "express";
import * as slabController from "../controllers/slab.controller";

import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.put("/:slabId/hold", authenticateUser, slabController.updateSlabHoldStatus);

router.put("/:slabId/cart", authenticateUser, slabController.updateSlabCartStatus);

// Create a new Remeasurement
router.post("/:slabId/remeasure", authenticateUser, slabController.createSlabLog);

// // Get all remeasurement by Slab id.
router.get("/:slabId", authenticateUser, slabController.getSlabWithLogs);

export default router;
