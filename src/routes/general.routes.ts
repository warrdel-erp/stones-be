import { Router } from "express";
import * as generalController from "../controllers/general.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/data", authenticateUser, generalController.getGeneralData);

export default router;
