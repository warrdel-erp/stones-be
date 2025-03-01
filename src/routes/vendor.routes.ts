import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";

const router = Router();

router.post("/", vendorController.createVendorController);

router.put("/:id", vendorController.updateVendorController);

// Get all vendors.
router.get("/", vendorController.getAllVendorsController);

export default router;
