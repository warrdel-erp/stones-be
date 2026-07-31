import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as guestSelectionController from "../controllers/guestSelection.controller";

const router = express.Router();

// Public routes (for Guest User on Mobile / Web)
router.get("/public/client/:qrCode", guestSelectionController.getClientByQrHandler);
router.get("/public/inventory-product/:qrCode", guestSelectionController.getInventoryProductByQrHandler);
router.post("/public/submit", guestSelectionController.submitGuestSelectionHandler);

// Authenticated CRM routes (for Client users in CRM)
router.get("/", authenticateUser, guestSelectionController.getGuestSelectionsHandler);
router.get("/:id", authenticateUser, guestSelectionController.getGuestSelectionByIdHandler);
router.delete("/:id", authenticateUser, guestSelectionController.deleteGuestSelectionHandler);
router.put("/:id/status", authenticateUser, guestSelectionController.updateGuestSelectionStatusHandler);

export default router;
