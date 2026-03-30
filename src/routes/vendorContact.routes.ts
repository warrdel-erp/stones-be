import express from "express";
import * as vendorContactController from "../controllers/vendorContact.controller";
import { authenticateUser } from "../middleware/authMiddleware";

import { validateRequest } from "../middleware/validationMiddleware";
import { vendorContactSchema, updateVendorContactSchema } from "../validators/vendorContact.validator";

const router = express.Router();

/**
 * @route   POST /vendor-contacts
 * @desc    Create a new vendor contact
 * @access  Private
 */
router.post("/", authenticateUser, validateRequest(vendorContactSchema), vendorContactController.createVendorContactController);

/**
 * @route   PUT /vendor-contacts/:id
 * @desc    Update a vendor contact
 * @access  Private
 */
router.put("/:id", authenticateUser, validateRequest(updateVendorContactSchema), vendorContactController.updateVendorContactController);

/**
 * @route   DELETE /vendor-contacts/:id
 * @desc    Delete a vendor contact
 * @access  Private
 */
router.delete("/:id", authenticateUser, vendorContactController.deleteVendorContactController);

/**
 * @route   GET /vendor-contacts
 * @desc    Get all vendor contacts with pagination and basic filters
 * @access  Private
 */
router.get("/", authenticateUser, vendorContactController.getAllVendorContactsController);

/**
 * @route   GET /vendor-contacts/vendor/:vendorId
 * @desc    Get all contacts for a specific vendor
 * @access  Private
 */
router.get("/vendor/:vendorId", authenticateUser, vendorContactController.getContactsByVendorIdController);

export default router;
