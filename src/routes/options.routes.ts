import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getServiceOptions, getCustomerInvoiceOptions } from "../controllers/options.controller";

const router = Router();

router.use(authenticateUser);

router.get("/services", getServiceOptions);
router.get("/customer/:customerId/invoices", getCustomerInvoiceOptions);

export default router;

