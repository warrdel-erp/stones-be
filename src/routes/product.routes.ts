import express from "express";
import * as productController from "../controllers/product.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// Create a new product
router.post("/", authenticateUser, productController.createProduct);

// Get all products.
router.get("/", authenticateUser, productController.getProducts);

// Get all products.
router.get("/:productId/tabs/:tab", authenticateUser, productController.getProductsTabsData);

// Update product
router.put("/:id", authenticateUser, productController.updateProductById);

// Get Product by id
router.get("/:id", authenticateUser, productController.getProductById);

export default router;
