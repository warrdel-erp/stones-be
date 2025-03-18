import express from "express";
import * as productController from "../controllers/product.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateUser, productController.createProduct);

// Get all products.
router.get("/", authenticateUser, productController.getProducts);

// Update product
router.put("/:id", authenticateUser, productController.updateProductById);

// Get Product by id
router.get("/:id", authenticateUser, productController.getProductById);

export default router;
