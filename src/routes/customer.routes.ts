import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import * as customerAddressController from "../controllers/customerAddress.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new customer
router.post("/", authenticateUser, customerController.createCustomerController);

// create address for customer
router.post("/address", authenticateUser, customerAddressController.createCustomerAddress);

// Get all addresses of customer
router.get("/:customerId/addresses", customerAddressController.getAddressesByCustomerId);

// Update vendor.
router.put("/:id", authenticateUser, customerController.updateCustomerController);

// Get all vendors.
router.get("/", authenticateUser, customerController.getAllCustomersController);

// get customer invoices.
router.get("/:customerId/invoices", authenticateUser, customerController.getInvoicesByCustomerId);

// Get vendor by id.
router.get("/:id", authenticateUser, customerController.getCustomerByIdController);

export default router;
