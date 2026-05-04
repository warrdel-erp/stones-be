import express from "express";
import * as externalTransactionController from "../controllers/externalCustomerTransaction.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = express.Router();

// Bulk upload transactions via CSV
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), externalTransactionController.bulkUploadTransactions);

export default router;
