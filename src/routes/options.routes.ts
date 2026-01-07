import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getServiceOptions, getCustomerInvoiceOptions, getCustomerOptions, getProductOptions, getVendorOptions, getCustomerAddressOptions, getLocationOptions, getLedgerAccountOptions } from "../controllers/options.controller";

const router = Router();

router.use(authenticateUser);

router.get("/services", getServiceOptions);

router.get("/customers", getCustomerOptions);

router.get("/products", getProductOptions);

router.get("/vendors", getVendorOptions);

router.get("/locations", getLocationOptions);

router.get("/ledgerAccounts", getLedgerAccountOptions);

router.get("/customer/:customerId/invoices", getCustomerInvoiceOptions);

router.get("/customer/:customerId/addresses", getCustomerAddressOptions);

export default router;
