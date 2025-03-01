import express from "express";
import * as productController from "../controllers/product.controller";

const router = express.Router();

router.post("/", productController.createProduct);

// Get all products.
router.get("/", productController.getProducts);

// Update product
router.put("/:id", productController.updateProductById);

export default router;
