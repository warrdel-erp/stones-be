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

router.get("/all",userAuth, getAllSupplier);

router.get('/',userAuth, getSingleSupplierDetails)

router.patch("/:supplierName", userAuth, updateSupplier);

export default router;  
