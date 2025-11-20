import { Router } from "express";
import { initiateDelivery, getAllDeliveriesByClientId, approveDeliveryOrders, completeDelivery, rejectDelivery } from "../controllers/delivery.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { deliveryOrderApprovalSchema } from "../validators";

const router = Router();

router.post("/initiate", authenticateUser, initiateDelivery);

router.get("/", authenticateUser, getAllDeliveriesByClientId);

router.post("/approve", authenticateUser, validateRequest(deliveryOrderApprovalSchema), approveDeliveryOrders);

router.put("/:deliveryId/complete", authenticateUser, completeDelivery);

router.put("/:deliveryId/reject", authenticateUser, rejectDelivery);

export default router; 