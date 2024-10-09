import { Router } from "express";
const router = Router();

import { userAuth } from "../middleware/authUser.js";
import {  getQRCode } from "../controllers/qrController.js";

router.get("/", getQRCode);

export default router;  
