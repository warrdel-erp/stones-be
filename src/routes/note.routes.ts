import express from "express";
import * as notesController from "../controllers/notes.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Get all notes with filters
router.get("/", authenticateUser, notesController.getNotes);

export default router;
