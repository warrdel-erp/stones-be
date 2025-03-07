import { Router } from "express";
import * as billController from "../controllers/bill.controller";
import { authenticateUser } from "../middleware/authMiddleware";
const router = Router();

// Route to register a new client
router.post("/", authenticateUser, billController.createBill);

// Route to get all clients
router.get("/", authenticateUser, billController.getAllBills);

// Route to get a single client
router.get("/:id", authenticateUser, billController.getBillById);

export default router;
