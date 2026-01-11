import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createUserByAccountSchema } from "../validators";

const router = Router();

// Route to register a new client.
router.post("/register", userController.registerUserHandler);

// Assign Location to user.
router.put("/assignLocation", authenticateUser, userController.assignLocation);

// Remove Location from user.
router.delete("/removeLocation", authenticateUser, userController.removeUserLocation);

// Get All Users.
router.get("/", authenticateUser, userController.getAllUsersController);

// Get Assigned Location to user own.
router.get("/getLocations", authenticateUser, userController.getUserLocations);

// get assigned location to user by userId.
router.get("/:id/locations", authenticateUser, userController.getUserLocations);

// Get All Users for the client of requesting user
router.get("/clientUsers", authenticateUser, userController.getClientUsers);

// Get user by ID
router.get("/:id", authenticateUser, userController.getUser);

// Update User.
router.put("/:id", authenticateUser, userController.updateUserController);

// Create User by Authenticated Account
router.post("/createUser", authenticateUser, validateRequest(createUserByAccountSchema), userController.createUserByAccountController);


export default router;
