import { Router } from "express";
const router = Router();

import { userAuth } from "../middleware/authUser.js";
import { addFreightBill, getFreightAccounts, getFreightData } from "../controllers/freightController.js";

router.post("/", userAuth, addFreightBill);

router.get("/", userAuth, getFreightData);

router.get("/freightAccounts", userAuth, getFreightAccounts);


export default router;  
