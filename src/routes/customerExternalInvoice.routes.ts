import express from "express";
import * as invoiceController from "../controllers/customerExternalInvoice.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = express.Router();

// Bulk upload transactions via CSV/Excel
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), invoiceController.bulkUploadInvoices);

// Get all transactions with pagination and search
router.get("/", authenticateUser, invoiceController.getAllInvoicesController);

export default router;
