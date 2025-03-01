import express from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/location/:locationId", authenticateUser, inventoryController.getProductsByLocation);

export default router;
