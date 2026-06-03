import express from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/stats", authenticateUser, inventoryController.getInventoryStats);
router.get("/location/:locationId", authenticateUser, inventoryController.getProductsByLocation);
router.get("/products", authenticateUser, inventoryController.getProductsOnly);
router.get("/products/:productId/blocks", authenticateUser, inventoryController.getBlocksByProduct);
router.get("/products/:productId/bundles", authenticateUser, inventoryController.getBundlesByProduct);
router.get("/products/:productId/sipls", authenticateUser, inventoryController.getSiplsByProduct);

export default router;

