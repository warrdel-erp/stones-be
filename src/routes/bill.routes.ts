import { Router } from "express";
import * as billController from "../controllers/bill.controller";
import { authenticateUser } from "../middleware/authMiddleware";
const router = Router();

// Route to register a new client
router.post("/", authenticateUser, billController.createBill);

export default router;
