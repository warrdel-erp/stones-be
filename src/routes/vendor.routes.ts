import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = Router();

// Create vendor.
router.post("/", authenticateUser, vendorController.createVendorController);

// Bulk upload vendors via CSV
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), vendorController.bulkUploadVendors);

// Update vendor.
router.put("/:id", authenticateUser, vendorController.updateVendorController);

// Get all vendors.
router.get("/", authenticateUser, vendorController.getAllVendorsController);

// Get vendors according to SIPLs
router.get("/sipl/:siplId", authenticateUser, vendorController.vendorAccordingToSIPL); // Get vendor by ID

// Route to get all clients
router.get("/:vendorId/paymentBills", authenticateUser, vendorController.getAllBillsForVendor);

// Get vendor by ID.
router.get("/:id", authenticateUser, vendorController.getVendorById); // Get vendor by ID

export default router;
