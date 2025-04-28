import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Get total amount of sales invoices from last N days
router.get("/totalSalesAmount", authenticateUser, dashboardController.getTotalAmountFromLastNDays);

// Get total amount of SIPL products from last N days
router.get("/totalPurchaseAmount", authenticateUser, dashboardController.getTotalSIPLProductAmount);

// total open purchase orders.
router.get("/totalOpenPo", authenticateUser, dashboardController.getOpenPOCountByClient);

// total open sales orders.
router.get("/totalOpenSo", authenticateUser, dashboardController.getOpenSOCountByClient);

// Get total PO in transit.
router.get("/totalPoInTransit", authenticateUser, dashboardController.getPoInTransit);

// Get total Customers in transit.
router.get("/totalCustomersAmounts", authenticateUser, dashboardController.getTotalAndPaidCustomerAmount);

// Get total Vendors in transit.
router.get("/totalVendorsAmounts", authenticateUser, dashboardController.getTotalAndPaidVendorAmount);

export default router;
