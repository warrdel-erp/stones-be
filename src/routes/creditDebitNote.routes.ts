import { Router } from "express";
import * as creditDebitNoteController from "../controllers/creditDebitNote.controller";
import { validateRequest } from "../middleware/validationMiddleware";
import { authenticateUser } from "../middleware/authMiddleware";
import {
    createCreditDebitNoteSchema,
    updateCreditDebitNoteSchema
} from "../validators/creditDebitNote.validator";

const router = Router();

// Create credit/debit note
router.post(
    "/",
    authenticateUser,
    validateRequest(createCreditDebitNoteSchema),
    creditDebitNoteController.createCreditDebitNote
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

export default router;
