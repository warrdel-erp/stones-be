import { Router } from "express";
import * as accountController from "../controllers/account.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Get locations based on account type (user or client)
router.get("/locations", authenticateUser, accountController.getAccountLocations);

// Get account by ID
router.get("/:id", authenticateUser, accountController.getAccountById);

export default router; 