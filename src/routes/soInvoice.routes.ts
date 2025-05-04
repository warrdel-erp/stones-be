import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as soInvoiceController from '../controllers/soInvoice.controller'

const router = Router();

// get all so invoice.
router.get("/", authenticateUser, soInvoiceController.getAllSoInvoiceList);

// assign truck to SO invoice.
router.put("/:id/assignTruck", authenticateUser, soInvoiceController.assignTruck);

export default router; 