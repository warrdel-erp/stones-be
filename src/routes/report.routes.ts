import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as reportController from "../controllers/report.controller";

const router = Router();

// Inventory Summary Report
router.get("/inventory-summary", authenticateUser, reportController.getInventorySummaryReport);

// Slab Inventory Detail Report
router.get("/slab-inventory-detail", authenticateUser, reportController.getSlabInventoryDetail);

// Inventory Valuation Report
router.get("/inventory-valuation", authenticateUser, reportController.getInventoryValuationReport);

// Inventory Aging Report
router.get("/inventory-aging", authenticateUser, reportController.getInventoryAgingReport);


// Held Inventory Report
router.get("/held-inventory", authenticateUser, reportController.getHeldInventoryReport);


// Sales Order Register Report
router.get("/sales-order-register", authenticateUser, reportController.getSalesOrderRegisterReport);


// Slab Sales Detail Report
router.get("/slab-sales-detail", authenticateUser, reportController.getSlabSalesDetailReport);


// Sales by Customer Report
router.get("/sales-by-customer", authenticateUser, reportController.getSalesByCustomerReport);


// Sales by Product Report
router.get("/sales-by-product", authenticateUser, reportController.getSalesByProductReport);


// Sales Profitability Report
router.get("/sales-profitability", authenticateUser, reportController.getSalesProfitabilityReport);


// Purchase Order Register Report
router.get("/purchase-order-register", authenticateUser, reportController.getPurchaseOrderRegisterReport);


// Purchase Detail Report
router.get("/purchase-detail", authenticateUser, reportController.getPurchaseDetailReport);


// Purchases by Supplier Report
router.get("/purchases-by-supplier", authenticateUser, reportController.getPurchasesBySupplierReport);


// Invoice Register Report
router.get("/invoice-register", authenticateUser, reportController.getInvoiceRegisterReport);


// Accounts Receivable Ageing Report
router.get("/ar-ageing", authenticateUser, reportController.getArAgeingReport);


// Payment Report
router.get("/payment", authenticateUser, reportController.getPaymentReport);


// Customer Master Report
router.get("/customer-master", authenticateUser, reportController.getCustomerMasterReport);


// Supplier Master Report
router.get("/supplier-master", authenticateUser, reportController.getSupplierMasterReport);


// Fabricator Master Report
router.get("/fabricator-master", authenticateUser, reportController.getFabricatorMasterReport);

export default router;
