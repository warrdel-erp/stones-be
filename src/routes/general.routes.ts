import { Router } from "express";
import * as generalController from "../controllers/general.controller";

const router = Router();

router.get("/data", generalController.getGeneralData);

export default router;
