import { Router } from "express";
import { initiateDelivery, getAllDeliveriesByClientId } from "../controllers/delivery.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.post("/initiate", authenticateUser, initiateDelivery);

router.get("/", authenticateUser, getAllDeliveriesByClientId);

export default router; 