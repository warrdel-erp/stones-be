import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as soInvoiceController from '../controllers/soInvoice.controller'

const router = Router();

// create so invoice from selected products.
router.post("/", authenticateUser, soInvoiceController.createInvoice);

// get all so invoice.
router.get("/", authenticateUser, soInvoiceController.getAllSoInvoiceList);

// get all so invoice.
// router.get("/withTruckOnly", authenticateUser, soInvoiceController.getAllSoInvoiceListWithTruckOnly);

// assign truck to SO invoice.
router.put("/:id/assignTruck", authenticateUser, soInvoiceController.assignTruck);

// get overdue invoices.
router.get("/overdue", authenticateUser, soInvoiceController.getOverdueInvoices);

// get SO invoice by Id.
router.get("/:id", authenticateUser, soInvoiceController.getInvoiceById);

// get sales order products without returns for a specific invoice
router.get("/:id/productsWithoutReturns", authenticateUser, soInvoiceController.getSalesOrderProductsWithoutReturns);

// write off unpaid customer invoice balance to Bad Debt Expense
router.post("/:id/writeOff", authenticateUser, soInvoiceController.writeOffInvoice);

export default router; 