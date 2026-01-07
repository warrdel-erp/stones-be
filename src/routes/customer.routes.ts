import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import * as customerAddressController from "../controllers/customerAddress.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create a new customer
router.post("/", authenticateUser, customerController.createCustomerController);

// create address for customer
router.post("/address", authenticateUser, customerAddressController.createCustomerAddress);

// Get customer address by id
router.get("/address/:id", authenticateUser, customerAddressController.getCustomerAddressById);

// Get all addresses of customer
router.get("/:customerId/addresses", customerAddressController.getAddressesByCustomerId);

// Update customer.
router.put("/:id", authenticateUser, customerController.updateCustomerController);

// Get all customers.
router.get("/", authenticateUser, customerController.getAllCustomersController);

// get customer invoices.
router.get("/:customerId/invoices", authenticateUser, customerController.getInvoicesByCustomerId);

// get customer advanced deposits.
router.get("/:customerId/advancedDeposits", authenticateUser, customerController.getAdvancedDepositsByCustomerId);

// Get customer minimal data (less detailed)
router.get("/minimal/:id", authenticateUser, customerController.getCustomerMinimalController);

// Get customer by id.
router.get("/:id", authenticateUser, customerController.getCustomerByIdController);

export default router;
