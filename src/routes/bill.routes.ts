import { Router } from "express";
import * as billController from "../controllers/bill.controller";
const router = Router();

// Route to register a new client
router.post("/", billController.createBill);

export default router;
