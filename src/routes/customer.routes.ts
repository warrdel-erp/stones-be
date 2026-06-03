import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import * as customerAddressController from "../controllers/customerAddress.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import * as customerAddressValidator from "../validators/customerAddress.validator";

const router = Router();

// Create a new customer
router.post("/", authenticateUser, customerController.createCustomerController);

// Bulk upload customers via CSV
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), customerController.bulkUploadCustomers);

// create address for customer
router.post("/address", authenticateUser, validateRequest(customerAddressValidator.customerAddressSchema), customerAddressController.createCustomerAddress);

// Get customer address by id
router.get("/address/:id", authenticateUser, customerAddressController.getCustomerAddressById);

// Get all addresses of customer
router.get("/:customerId/addresses", authenticateUser, customerAddressController.getAddressesByCustomerId);

// Update customer address
router.put("/address/:id", authenticateUser, validateRequest(customerAddressValidator.updateCustomerAddressSchema), customerAddressController.updateCustomerAddress);

// Delete customer address
router.delete("/address/:id", authenticateUser, customerAddressController.deleteCustomerAddress);

// Update customer.
router.put("/:id", authenticateUser, customerController.updateCustomerController);

// Get all customers.
router.get("/", authenticateUser, customerController.getAllCustomersController);

// get customer invoices.
router.get("/:customerId/invoices", authenticateUser, customerController.getInvoicesByCustomerId);

// get customer AR invoices (standard + external merged & paginated)
router.get("/:customerId/ar", authenticateUser, customerController.getCustomerARInvoices);

// get customer advanced deposits.
router.get("/:customerId/advancedDeposits", authenticateUser, customerController.getAdvancedDepositsByCustomerId);

// Get customer minimal data (less detailed)
router.get("/minimal/:id", authenticateUser, customerController.getCustomerMinimalController);

// Get customer by id.
router.get("/:id", authenticateUser, customerController.getCustomerByIdController);

export default router;
