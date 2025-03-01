import { Router } from "express";
import * as binController from "../controllers/bin.controller";
const router = Router();

// Route to register a new client
router.get("/location/:locationId", binController.getBinsByLocationController);

export default router;
