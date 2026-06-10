import express from "express";
import * as productController from "../controllers/product.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";

const router = express.Router();

// Create a new product
router.post("/", authenticateUser, productController.createProduct);

// Bulk upload products via CSV
router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), productController.bulkUploadProducts);

// Get all products.
router.get("/", authenticateUser, productController.getProducts);

// Get all products with less data..
router.get("/compact", authenticateUser, productController.getProductsWithCompactData);

// Get all products.
router.get("/landedCost/:productId", authenticateUser, productController.getLandedCost);

// Get all products.
router.get("/:productId/tabs/:tab", authenticateUser, productController.getProductsTabsData);

// Update product
router.put("/:id", authenticateUser, productController.updateProductById);

// Get products with empty bin.
router.get("/emptyBin", authenticateUser, productController.getProductsWithEmptyBinInventory);

// Get Product by id
router.get("/:id", authenticateUser, productController.getProductById);

// Add an image to product
router.post("/:id/images", authenticateUser, productController.addProductImage);

// Delete an image from product
router.delete("/images/:imageId", authenticateUser, productController.deleteProductImage);

// Get images of product
router.get("/:id/images", authenticateUser, productController.getProductImages);

// Set primary image of product
router.put("/:id/images/:imageId/primary", authenticateUser, productController.setPrimaryImage);

export default router;
