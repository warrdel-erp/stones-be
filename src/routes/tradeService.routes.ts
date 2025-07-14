import { Router } from "express";
import * as tradeServiceController from "../controllers/tradeService.controller";
import { validateRequest } from "../middleware/validationMiddleware";
import { createTradeServiceSchema } from "../validators";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateUser, validateRequest(createTradeServiceSchema), tradeServiceController.createTradeService);
router.get("/", authenticateUser, tradeServiceController.listTradeServices);
router.delete("/:id", authenticateUser, tradeServiceController.deleteTradeService);

export default router; 