import express from "express";
import * as agedInvoiceController from "../controllers/customerExternalAgedInvoice.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = express.Router();

// Bulk upload transactions via CSV/Excel
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), agedInvoiceController.bulkUploadAgedInvoices);

// Get all transactions with pagination and search
router.get("/", authenticateUser, agedInvoiceController.getAllAgedInvoicesController);

export default router;
