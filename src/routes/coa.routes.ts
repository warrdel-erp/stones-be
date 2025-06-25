import { Router } from "express";
import * as coaController from "../controllers/coa.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/accountsData", coaController.getCoaData);

router.get("/balanceSheetData", authenticateUser, coaController.getBalanceSheetData);

export default router;
