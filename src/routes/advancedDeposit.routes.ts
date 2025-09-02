import { Router } from "express";
import * as advancedDepositController from "../controllers/advancedDeposit.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createAdvancedDepositSchema } from "../validators";

const router = Router();

// Create a new advanced deposit
router.post("/", authenticateUser, validateRequest(createAdvancedDepositSchema), advancedDepositController.createAdvancedDepositHandler);

router.get('/withoutPagination', authenticateUser, advancedDepositController.getAdvancedDepositWithoutPagination)

export default router; 