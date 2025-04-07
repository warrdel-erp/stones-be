import { Router } from "express";
import { getJournalEntries } from "../controllers/journalEntry.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateUser, getJournalEntries);

export default router;
