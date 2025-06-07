import { Router } from "express";
import * as advancedDepositController from "../controllers/advancedDeposit.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new advanced deposit
router.post("/", authenticateUser, advancedDepositController.createAdvancedDepositHandler);

export default router; 