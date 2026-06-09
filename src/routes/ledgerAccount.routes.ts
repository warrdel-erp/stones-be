import express from "express";
import * as ledgerAccountController from "../controllers/ledgerAccount.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = express.Router();

// Ledger Account routes.
router.post("/", authenticateUser, ledgerAccountController.createLedgerAccount);

// Get all ledger accounts.
router.get("/", authenticateUser, ledgerAccountController.getLedgerAccounts);

// Get all ledger accounts without pagination.
router.get("/withoutPagination", authenticateUser, ledgerAccountController.getLedgerAccountsWithoutPagination);

// Get ledger accounts for freight items.
router.get("/forFreightItems", authenticateUser, ledgerAccountController.getLedgerAccountsForFreightItems);

// Get default ledger accounts for product.
router.get("/defaultLedgerAccountsForProduct", authenticateUser, ledgerAccountController.getDefaultLedgerAccountsForProduct);

// Get ledger account by ID.
router.get("/:id", authenticateUser, ledgerAccountController.getLedgerAccountById);

// Bulk upload ledger accounts.
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), ledgerAccountController.bulkUploadLedgerAccounts);

// router.put("/:id", ledgerAccountController.updateLedgerAccount);
// router.delete("/:id", ledgerAccountController.deleteLedgerAccount);

export default router;
