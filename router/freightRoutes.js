import { Router } from "express";
const router = Router();

import { userAuth } from "../middleware/authUser.js";
import { addFreightBill, getFreightAccounts, getFreightData } from "../controllers/freightController.js";

router.post("/", addFreightBill);

router.get("/", getFreightData);

router.get("/freightAccounts", getFreightAccounts);


export default router;  
