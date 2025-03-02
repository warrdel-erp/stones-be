import { Router } from "express";
import * as coaController from "../controllers/coa.controller";

const router = Router();

router.get("/accountsData", coaController.getCoaData);

export default router;
