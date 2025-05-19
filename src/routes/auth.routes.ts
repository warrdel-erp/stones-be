import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Login route for both users and clients
router.post("/login", authController.login);

// User profile route (protected)
router.get("/userProfile", authenticateUser, authController.getUserProfile);

export default router; 