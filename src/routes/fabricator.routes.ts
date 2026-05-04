import { Router } from "express";
import * as fabricatorController from "../controllers/fabricator.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/:fabricatorId/products",
  authenticateUser,
  fabricatorController.getProductsSoldToFabricator
);

router.get(
  "/:fabricatorId/products/:productId/inventory",
  authenticateUser,
  fabricatorController.getInventoryProductsSoldToFabricator
);

export default router;
