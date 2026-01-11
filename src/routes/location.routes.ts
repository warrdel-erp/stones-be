import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createLocationSchema } from "../validators";
import * as locationController from "../controllers/location.controller";

const router = Router();

router.use(authenticateUser);

// Create location
router.post("/", validateRequest(createLocationSchema), locationController.createLocation);

// Get location by id
router.get("/:id", locationController.getLocationById);

export default router;

