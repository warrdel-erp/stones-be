import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

// Create a new payment
router.post("/", paymentController.createPayment);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payment by id
router.get("/:id", paymentController.getPaymentById);

export default router;
