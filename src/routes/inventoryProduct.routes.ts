import express from "express";
import * as inventoryProductController from "../controllers/inventoryProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Get inventory products according to siplId
router.get("/", authenticateUser, inventoryProductController.getInventoryProductsBySIPLCombinedNumber);

// Update selling price of inventory products
router.put("/sellingPrice", authenticateUser, inventoryProductController.updateInventoryProductsSellingPrice);

// Get allocated inventory products according to customer
router.get("/allocated", authenticateUser, inventoryProductController.getAllocatedInventoryProductsAccordingToCustomer);

export default router;
