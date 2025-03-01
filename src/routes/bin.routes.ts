import { Router } from "express";
import * as binController from "../controllers/bin.controller";
import { authenticateUser } from "../middleware/authMiddleware";
const router = Router();

// Get bin by Location
router.get("/location/:locationId", authenticateUser, binController.getBinsByLocationController);

export default router;
