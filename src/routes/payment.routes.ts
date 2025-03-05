import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

// Create a new payment
router.post("/payments", paymentController.createPayment);

// Get all payments
router.get("/payments", paymentController.getAllPayments);

// Get payment by id
router.get("/payments/:id", paymentController.getPaymentById);

export default router;
