import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Route to register a new client
router.post("/register", userController.registerUserHandler);

// Login user
router.post("/login", userController.login);

// Assign Location to user
router.put("/assignLocation", authenticateUser, userController.assignLocation);

// Get All Users
router.get("/", userController.getAllUsersController);

// Update User
router.put("/:id", userController.updateUserController);

export default router;
