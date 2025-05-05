import { Router } from "express";
import * as clientController from "../controllers/client.controller";

const router = Router();

// Route to register a new client
router.post("/register", clientController.registerClientHandler);

// Get all clients with pagination and optional search filtering
router.get("/", clientController.getClients);

// Get all clients with pagination and optional search filtering
router.get("/checkEmailExists", clientController.checkEmailExists);

// Update an existing client by ID
router.put("/:id", clientController.updateClient);


export default router;
