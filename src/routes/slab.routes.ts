import { Router } from "express";
import * as slabController from "../controllers/slab.controller";
import { validateRequest } from "../middleware/validationMiddleware";
import { splitSlabSchema } from "../validators";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Check if all slabs in a SIPL are fully filled
router.get("/sipl/:siplId/checkFullyFilled", authenticateUser, slabController.checkSiplSlabsFullyFilled);

// Bulk update slabs
router.put("/bulkUpdate", authenticateUser, slabController.bulkUpdateSlabs);

// Update slab
router.put("/:slabId", authenticateUser, slabController.updateSlab);

// Create a new Remeasurement
router.post("/:slabId/remeasure", authenticateUser, slabController.createSlabLog);

// Split a slab into multiple pieces
router.post("/:slabId/split", authenticateUser, validateRequest(splitSlabSchema), slabController.splitSlab);

// Get all split slabs
router.get("/splittedSlabs", authenticateUser, slabController.getSplitSlabs);

// Get all slabs with filter
router.get("/", authenticateUser, slabController.getAllSlabs);

// Get split history for a slab (must come before /:slabId route)
router.get("/:slabId/splitHistory", authenticateUser, slabController.getSlabSplitHistory);

// // Get all remeasurement by Slab id.
router.get("/:slabId", authenticateUser, slabController.getSlabWithLogs);

export default router;
