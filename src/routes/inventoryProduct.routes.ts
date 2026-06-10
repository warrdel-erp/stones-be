import express from "express";
import * as inventoryProductController from "../controllers/inventoryProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { uploadCSV } from "../middleware/uploadMiddleware";
import { inventoryProductArraySchema } from "../validators";

const router = express.Router();

router.put("/assignBin", authenticateUser, validateRequest(inventoryProductArraySchema), inventoryProductController.assignbinInventoryProducts);

router.post("/bulkUpload", authenticateUser, uploadCSV.single("file"), inventoryProductController.bulkUploadInventoryProducts);

// Get inventory products according to siplId
router.get("/specialFilters", authenticateUser, inventoryProductController.getInventoryProductsBySIPLCombinedNumber);

// Get inventory products according to siplId
router.get("/", authenticateUser, inventoryProductController.getInventoryProducts);

// Get inventory products according to siplId with pagination
router.get("/paginated", authenticateUser, inventoryProductController.getInventoryProductsPaginated);

// Get inventory products with empty bin
router.get("/emptyBin", authenticateUser, inventoryProductController.getInventoryProductsWithEmptyBin);

// Update selling price of inventory products
router.put("/sellingPrice", authenticateUser, inventoryProductController.updateInventoryProductsSellingPrice);

// Get allocated inventory products according to customer
router.get("/allocated", authenticateUser, inventoryProductController.getAllocatedInventoryProductsAccordingToCustomer);

// Get allocated inventory products with sales order and customer details
router.get("/:id/allocatedDetails", authenticateUser, inventoryProductController.getAllocatedInventoryProductDetails);

// put and remove slab to cart
router.put("/:inventoryProductId/cart", authenticateUser, inventoryProductController.updateInventoryProductCartStatus);

// Get hold details by hold ID
router.get("/hold/:holdId", authenticateUser, inventoryProductController.getHoldById);

// Hold an inventory product
router.post("/:id/hold", authenticateUser, inventoryProductController.holdInventoryProduct);

// Create multiple holds on inventory products with customerId
router.post("/holds/bulk", authenticateUser, inventoryProductController.createBulkHolds);

// Unhold an inventory product
router.delete("/:id/hold", authenticateUser, inventoryProductController.unholdInventoryProduct);

// Get inventory product details by qrCode
router.get("/qr/:qrCode", authenticateUser, inventoryProductController.getInventoryProductByQrCode);

// Add an image to inventory product
router.post("/:id/images", authenticateUser, inventoryProductController.addInventoryProductImage);

// Delete an image from inventory product
router.delete("/images/:imageId", authenticateUser, inventoryProductController.deleteInventoryProductImage);

// Get images of inventory product
router.get("/:id/images", authenticateUser, inventoryProductController.getInventoryProductImages);

// Set primary image of inventory product
router.put("/:id/images/:imageId/primary", authenticateUser, inventoryProductController.setPrimaryImage);

export default router;
