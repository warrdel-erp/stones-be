import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create vendor.
router.post("/", authenticateUser, vendorController.createVendorController);

// Update vendor.
router.put("/:id", authenticateUser, vendorController.updateVendorController);

// Get all vendors.
router.get("/", authenticateUser, vendorController.getAllVendorsController);

// Get vendor by ID.
router.get("/:id", authenticateUser, vendorController.getVendorById); // Get vendor by ID

export default router;
