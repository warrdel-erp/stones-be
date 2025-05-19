import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Route to register a new client.
router.post("/register", userController.registerUserHandler);

// Assign Location to user.
router.put("/assignLocation", authenticateUser, userController.assignLocation);

// Get All Users.
router.get("/", userController.getAllUsersController);

// Assign Location to user.
router.get("/getLocations", authenticateUser, userController.getUserLocations);

// Set default location.
router.put("/setDefaultLocation", authenticateUser, userController.setDefaultLocation);

// Get user by ID
router.get("/:id", userController.getUser);

// Update User.
router.put("/:id", userController.updateUserController);

export default router;
