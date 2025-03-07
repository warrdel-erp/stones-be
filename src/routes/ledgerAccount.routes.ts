import express from "express";
import * as ledgerAccountController from "../controllers/ledgerAccount.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Ledger Account routes.
router.post("/", authenticateUser, ledgerAccountController.createLedgerAccount);

// Get all ledger accounts.
router.get("/", authenticateUser, ledgerAccountController.getLedgerAccounts);

// Get ledger account by ID.
router.get("/:id", authenticateUser, ledgerAccountController.getLedgerAccountById);

// router.put("/:id", ledgerAccountController.updateLedgerAccount);
// router.delete("/:id", ledgerAccountController.deleteLedgerAccount);

export default router;
