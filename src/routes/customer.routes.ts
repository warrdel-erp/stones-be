import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateUser, customerController.createCustomerController);

// Update vendor.
router.put("/:id", customerController.updateCustomerController);

// Get all vendors.
router.get("/", customerController.getAllCustomersController);

export default router;
