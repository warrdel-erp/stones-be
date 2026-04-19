import { Router } from "express";
import * as clientController from "../controllers/client.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { deleteClientAccountSchema } from "../validators/auth.validator";

const router = Router();

// Route to register a new client
router.post("/register", clientController.registerClientHandler);

// Get all clients with pagination and optional search filtering
router.get("/", clientController.getClients);

// Update an existing client by ID
router.put("/:id", clientController.updateClient);

// Public route: permanently delete a client account (requires email + password for confirmation)
router.delete("/deleteAccount", validateRequest(deleteClientAccountSchema), clientController.deleteClientAccountHandler);

export default router;
