import express from "express";
import * as inventoryProductController from "../controllers/inventoryProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Get inventory products according to siplId
router.get("/specialFilters", authenticateUser, inventoryProductController.getInventoryProductsBySIPLCombinedNumber);

// Get inventory products according to siplId
router.get("/", authenticateUser, inventoryProductController.getInventoryProducts);

// Update selling price of inventory products
router.put("/sellingPrice", authenticateUser, inventoryProductController.updateInventoryProductsSellingPrice);

// Get allocated inventory products according to customer
router.get("/allocated", authenticateUser, inventoryProductController.getAllocatedInventoryProductsAccordingToCustomer);

// put and remove slab to cart
router.put("/:inventoryProductId/cart", authenticateUser, inventoryProductController.updateInventoryProductCartStatus);

// Hold an inventory product
router.post("/:id/hold", authenticateUser, inventoryProductController.holdInventoryProduct);

// Unhold an inventory product
router.delete("/:id/hold", authenticateUser, inventoryProductController.unholdInventoryProduct);

// Get hold details by hold ID
router.get("/hold/:holdId", authenticateUser, inventoryProductController.getHoldById);

export default router;
