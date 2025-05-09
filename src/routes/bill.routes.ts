import { Router } from "express";
import * as billController from "../controllers/bill.controller";
import { authenticateUser } from "../middleware/authMiddleware";
const router = Router();

// Route to register a new client
router.post("/", authenticateUser, billController.createBill);

// Route to get all clients
router.get("/", authenticateUser, billController.getAllBills);

// Get new PO number
router.get("/newBillNumber", authenticateUser, billController.getNewBillNumber);

// Route to get last bill as per SIPL
router.get("/lastBillAsPerSipl/:siplId", authenticateUser, billController.getLastBillAsPerSIPL);

// Route to get a single client
router.get("/:id", authenticateUser, billController.getBillById);

export default router;
