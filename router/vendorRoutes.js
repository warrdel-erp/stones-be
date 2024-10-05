import { Router } from "express";
const router = Router();

import { userAuth } from "../middleware/authUser.js";
import { addVendor, getAllVendor } from "../controllers/vendorController.js";

router.post("/", userAuth, addVendor);

router.get("/all",userAuth, getAllVendor);

export default router;  
