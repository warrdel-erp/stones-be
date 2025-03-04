import { Router } from "express";
import * as packagingListController from "../controllers/packagingList.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import * as packagingListProductController from "../controllers/packagingListProduct.controller";

const router = Router();

// Create new LO
router.post("/", authenticateUser, packagingListController.createPackagingList);

// Get all PL
router.get("/", authenticateUser, packagingListController.getAllPackagingLists);

// Get Packaging List by Id
router.get("/:id", authenticateUser, packagingListController.getPackagingListById);

// Update Packaging List
router.put("/:id", authenticateUser, packagingListController.updatePackagingList);

// Update requested Packaging List product
router.put(
  "/:packagingListId/packagingListProduct",
  authenticateUser,
  packagingListProductController.upsertPackagingListProducts
);

// Update requested Packaging List product
router.get(
  "/:packagingListId/packagingListProduct",
  authenticateUser,
  packagingListProductController.getPackagingListProducts
);

export default router;
