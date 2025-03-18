import express from "express";
import * as masterController from "../controllers/master.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Get all notes with filters
router.get("/vendors", authenticateUser, masterController.getVendorList);

export default router;
