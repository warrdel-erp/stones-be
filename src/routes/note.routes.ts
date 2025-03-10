import express from "express";
import * as notesController from "../controllers/notes.controller";

const router = express.Router();

// Get all notes with filters
router.get("/", notesController.getNotes);

export default router;
