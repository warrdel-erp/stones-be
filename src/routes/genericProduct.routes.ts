import { Router } from "express";
import * as genericProductController from "../controllers/genericProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Get all generic products with filter
router.get("/", authenticateUser, genericProductController.getAllGenericProducts);

// Delete generic product
router.delete("/:id", authenticateUser, genericProductController.deleteGenericProduct);

export default router; 