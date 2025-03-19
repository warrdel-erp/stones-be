import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new payment
router.post("/", authenticateUser, paymentController.createPayment);

// Get all payments
router.get("/", authenticateUser, paymentController.getAllPayments);

// Get new transaction number
router.get("/newTransactionNumber", authenticateUser, paymentController.getNewTransactionNumber);

// Get payment by id
router.get("/:id", authenticateUser, paymentController.getPaymentById);

export default router;
