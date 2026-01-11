import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as accountController from "../controllers/account.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { changePasswordSchema } from "../validators/auth.validator";

const router = Router();

// Login route for both users and clients
router.post("/login", authController.login);

// User profile route (protected)
router.get("/userProfile", authenticateUser, authController.getUserProfile);

router.get("/me", authenticateUser, authController.getMyDetails);

// Change password route (protected)
router.put("/changePassword", authenticateUser, validateRequest(changePasswordSchema), authController.changePassword);

// Check if email exists in any account
router.get("/checkEmailExists", accountController.checkEmailExists);

export default router; 