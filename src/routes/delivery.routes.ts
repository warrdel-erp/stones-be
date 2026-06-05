import { Router } from "express";
import { initiateDelivery, getAllDeliveriesByClientId, approveDeliveryOrders, completeDelivery, rejectDelivery, startDelivery } from "../controllers/delivery.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { deliveryOrderApprovalSchema } from "../validators";

const router = Router();

router.post("/initiate", authenticateUser, initiateDelivery);

router.get("/", authenticateUser, getAllDeliveriesByClientId);

router.post("/approve", authenticateUser, validateRequest(deliveryOrderApprovalSchema), approveDeliveryOrders);

router.put("/:deliveryId/complete", authenticateUser, completeDelivery);

router.put("/:deliveryId/reject", authenticateUser, rejectDelivery);

router.put("/:deliveryId/start", authenticateUser, startDelivery);

export default router; 