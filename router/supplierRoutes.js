import { Router } from "express";
const router = Router();

import {
  addSupplier,
  getAllSupplier,
  getSingleSupplierDetails,
  updateSupplier,
} from "../controllers/supplierController.js";
import { userAuth } from "../middleware/authUser.js";

router.post("/", userAuth, addSupplier);

router.get("/all", getAllSupplier);

router.get("/:supplierName", getSingleSupplierDetails);

router.patch("/:supplierName", updateSupplier);

export default router;
