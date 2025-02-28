import { Router } from "express";
import { createVendorController } from "../controllers/vendor.controller";

const router = Router();

router.post("/", createVendorController);

export default router;
