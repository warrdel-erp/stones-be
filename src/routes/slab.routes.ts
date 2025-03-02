import { Router } from "express";
import * as slabController from "../controllers/slab.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Route to register a new client
router.put("/:slabId/hold", authenticateUser, slabController.updateSlabHoldStatus);

export default router;
