import { Router } from "express";
import * as selectionSheetController from "../controllers/selectionSheet.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new selection sheet
router.post("/", authenticateUser, selectionSheetController.createSelectionSheet);

// Get all selection sheets
router.get("/", authenticateUser, selectionSheetController.getAllSelectionSheets);

// Get selection sheet by ID
router.get("/:id", authenticateUser, selectionSheetController.getSelectionSheetById);

// Delete selection sheet
router.delete("/:id", authenticateUser, selectionSheetController.deleteSelectionSheet);

export default router;

