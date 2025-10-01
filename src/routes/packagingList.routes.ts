import { Router } from "express";
import * as packagingListController from "../controllers/packagingList.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create new LO
router.post("/", authenticateUser, packagingListController.createPackagingList);

// Get all PL
router.get("/", authenticateUser, packagingListController.getAllPackagingLists);

// Get new SO number.
router.get("/newPlNumber", authenticateUser, packagingListController.getNewPlNumber);

// Update Packaging List
router.put("/:id", authenticateUser, packagingListController.updatePackagingList);

// Get Packaging List by Id
router.get("/:id", authenticateUser, packagingListController.getPackagingListById);


export default router;
