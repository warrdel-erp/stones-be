import { Router } from "express";
import * as creditDebitNoteController from "../controllers/creditDebitNote.controller";
import { validateRequest } from "../middleware/validationMiddleware";
import { authenticateUser } from "../middleware/authMiddleware";
import {
    createCreditDebitNoteSchema,
    updateCreditDebitNoteSchema,
    settleCreditDebitNoteSchema
} from "../validators/creditDebitNote.validator";

const router = Router();

// Create and settle credit/debit note for SIPL
router.post(
    "/sipl",
    authenticateUser,
    validateRequest(createCreditDebitNoteSchema),
    creditDebitNoteController.createAndSettleSiplCreditNote
);

// Get all credit/debit notes
router.get(
    "/",
    authenticateUser,
    creditDebitNoteController.getAllCreditDebitNotes
);

// Get credit/debit note by ID
router.get(
    "/:id",
    authenticateUser,
    creditDebitNoteController.getCreditDebitNoteById
);

// Update credit/debit note
// router.put(
//     "/:id",
//     authenticateUser,
//     validateRequest(updateCreditDebitNoteSchema),
//     creditDebitNoteController.updateCreditDebitNote
// );

// Settle credit/debit note
router.post(
    "/:id/settle",
    authenticateUser,
    validateRequest(settleCreditDebitNoteSchema),
    creditDebitNoteController.settleCreditDebitNote
);

export default router;
