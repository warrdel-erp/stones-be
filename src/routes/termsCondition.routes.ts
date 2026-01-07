import express from "express";
import * as termsConditionController from "../controllers/termsCondition.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Create terms condition.
router.post("/", authenticateUser, termsConditionController.createTermsCondition);

// Get terms condition by client ID.
router.get("/", authenticateUser, termsConditionController.getTermsConditionByClientId);

// Update terms condition by ID.
router.put("/:id", authenticateUser, termsConditionController.updateTermsCondition);

export default router;


