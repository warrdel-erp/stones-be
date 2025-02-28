import { Router } from "express";
import { registerClientHandler } from "../controllers/client.controller";

const router = Router();

// Route to register a new client
router.post("/register", registerClientHandler);

// // Route to get all clients
// router.get("/", getClients);

// // Route to get a single client by ID
// router.get("/:id", getClientById);

export default router;
