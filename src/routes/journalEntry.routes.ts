import { Router } from "express";
import * as journalEntriesController from "../controllers/journalEntry.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// get Journal entries.
router.get("/", authenticateUser, journalEntriesController.getJournalEntries);

// create customer journal entry
router.post("/", authenticateUser, journalEntriesController.createJournalEntry);

export default router;
