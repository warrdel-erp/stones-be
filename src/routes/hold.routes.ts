import express from "express";
import * as holdController from "../controllers/hold.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Create hold
router.post("/", authenticateUser, holdController.createHold);

// Get all holds
router.get("/", authenticateUser, holdController.getAllHolds);

// Get hold by ID
router.get("/:id", authenticateUser, holdController.getHoldById);

// Delete hold
router.delete("/:id", authenticateUser, holdController.deleteHold);

// Delete hold item
router.delete("/items/:itemId", authenticateUser, holdController.deleteHoldItem);

export default router;
