import { Router } from "express";
import * as returnController from "../controllers/return.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createReturnSchema } from "../validators";

const router = Router();

// Create a new return
router.post("/",
    authenticateUser,
    validateRequest(createReturnSchema),
    returnController.createReturn
);

// Confirm a return
router.post("/:returnId/confirm",
    authenticateUser,
    returnController.confirmReturn
);

// Cancel a return
router.post("/:returnId/cancel",
    authenticateUser,
    returnController.cancelReturn
);

export default router; 