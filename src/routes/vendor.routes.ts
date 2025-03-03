import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create vendor.
router.post("/", authenticateUser, vendorController.createVendorController);

// Update vendor.
router.put("/:id", vendorController.updateVendorController);

// Get all vendors.
router.get("/", vendorController.getAllVendorsController);

export default router;
