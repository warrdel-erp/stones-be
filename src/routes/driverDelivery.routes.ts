import { Router } from "express";
import {
    getDriverDeliveries,
    getDriverCurrentDeliveries,
    getDriverCompletedDeliveries,
    driverStartDelivery,
    driverCompleteDelivery
} from "../controllers/driverDelivery.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateUser, getDriverDeliveries);
router.get("/current", authenticateUser, getDriverCurrentDeliveries);
router.get("/completed", authenticateUser, getDriverCompletedDeliveries);
router.put("/:deliveryId/start", authenticateUser, driverStartDelivery);
router.put("/:deliveryId/complete", authenticateUser, driverCompleteDelivery);

export default router;
