import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import * as locationController from "../controllers/location.controller";

const router = Router();

router.use(authenticateUser);

// Get location by id
router.get("/:id", locationController.getLocationById);

export default router;

