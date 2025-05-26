import { Router } from "express";
import * as accountController from "../controllers/account.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Get locations based on account type (user or client)
router.get("/locations", authenticateUser, accountController.getAccountLocations);

export default router; 