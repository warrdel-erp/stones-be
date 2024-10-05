import { Router } from "express";
const router = Router();

import { userAuth } from "../middleware/authUser.js";
import { addFreightBill, getFreightData } from "../controllers/freightController.js";

router.post("/", addFreightBill);

router.get("/", getFreightData);


export default router;  
