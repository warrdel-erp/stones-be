import express from "express";
import * as wiringInstructionController from "../controllers/wiringInstruction.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { wiringInstructionSchema, updateWiringInstructionSchema } from "../validators/wiringInstruction.validator";

const router = express.Router();

/**
 * @route   POST /api/wiring-instructions
 * @desc    Create a new wiring instruction
 * @access  Private
 */
router.post(
    "/", 
    authenticateUser, 
    validateRequest(wiringInstructionSchema), 
    wiringInstructionController.createWiringInstructionController
);

/**
 * @route   PUT /api/wiring-instructions/:id
 * @desc    Update a wiring instruction
 * @access  Private
 */
router.put(
    "/:id", 
    authenticateUser, 
    validateRequest(updateWiringInstructionSchema), 
    wiringInstructionController.updateWiringInstructionController
);

/**
 * @route   DELETE /api/wiring-instructions/:id
 * @desc    Delete a wiring instruction
 * @access  Private
 */
router.delete(
    "/:id", 
    authenticateUser, 
    wiringInstructionController.deleteWiringInstructionController
);

/**
 * @route   GET /api/wiring-instructions
 * @desc    Get all wiring instructions with pagination
 * @access  Private
 */
router.get(
    "/", 
    authenticateUser, 
    wiringInstructionController.getAllWiringInstructionsController
);

/**
 * @route   GET /api/wiring-instructions/:id
 * @desc    Get wiring instruction by ID
 * @access  Private
 */
router.get(
    "/:id", 
    authenticateUser, 
    wiringInstructionController.getWiringInstructionByIdController
);


export default router;
