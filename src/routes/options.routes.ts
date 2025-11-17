import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getServiceOptions } from "../controllers/options.controller";

const router = Router();

router.use(authenticateUser);

router.get("/services", getServiceOptions);

export default router;

