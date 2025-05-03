import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as soInvoiceController from '../controllers/soInvoice.controller'

const router = Router();

// hold-unHold slab
router.get("/", authenticateUser, soInvoiceController.getAllSoInvoiceList);

export default router