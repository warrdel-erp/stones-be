import { Router } from "express";
import * as clientController from "../controllers/client.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Route to register a new client
router.post("/register", clientController.registerClientHandler);

// Get all clients with pagination and optional search filtering
router.get("/", clientController.getClients);

// Update an existing client by ID
router.put("/:id", clientController.updateClient);

export default router;
