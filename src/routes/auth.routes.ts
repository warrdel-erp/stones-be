import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as accountController from "../controllers/account.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Login route for both users and clients
router.post("/login", authController.login);

// User profile route (protected)
router.get("/userProfile", authenticateUser, authController.getUserProfile);

// Check if email exists in any account
router.get("/checkEmailExists", accountController.checkEmailExists);

export default router; 