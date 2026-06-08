import { Router } from "express";
import * as packagingListController from "../controllers/packagingList.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import * as packagingListProductController from "../controllers/packagingListProduct.controller";

const router = Router();

// Create new LO.
router.post("/", authenticateUser, packagingListController.createPackagingList);

// Get all LO.
router.get("/", authenticateUser, packagingListController.getAllPackagingLists);

// Update Packaging List.
router.put("/:id", authenticateUser, packagingListController.updatePackagingList);

// Update requested packaging list product.
router.put(
  "/:packagingListId/packagingListProduct",
  authenticateUser,
  packagingListProductController.upsertPackagingListProducts
);

// Update requested packaging list product.
router.get(
  "/:packagingListId/packagingListProduct",
  authenticateUser,
  packagingListProductController.getPackagingListProducts
);

// Get new SO number.
router.get("/newPlNumber", authenticateUser, packagingListController.getNewLoNumber);

// Create invoice.
router.put("/:id/createInvoice", authenticateUser, packagingListController.invoicePackagingList);

// Cancel packaging list.
router.put("/:id/cancel", authenticateUser, packagingListController.cancelPackagingList);

// Get packaging list by Id
router.get("/:id", authenticateUser, packagingListController.getPackagingListById);

// This API gives data of packaging list with soProduct that are only in given return or 
router.get("/accordingToReturnConfirmation/:returnId", authenticateUser, packagingListController.getPackagingListAsPerReturn);

// This API gives data of packaging list with soProduct that are only in given return or 
router.get("/withSoProductAsPerReturn/:returnId", authenticateUser, packagingListController.getPackagingListOnlyAsPerReturn);

export default router;
