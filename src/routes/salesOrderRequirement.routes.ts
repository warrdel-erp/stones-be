import { Router } from "express";
import * as controller from "../controllers/salesOrderRequirement.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { addRequirementLineSchema, updateAllocationsSchema } from "../validators/salesOrderRequirement.validator";

const router = Router();

router.get("/:salesOrderId/requirements", authenticateUser, controller.getRequirements);
router.post("/:salesOrderId/requirements", authenticateUser, validateRequest(addRequirementLineSchema), controller.addRequirementLine);
router.put("/:salesOrderId/requirements/:reqId/allocations", authenticateUser, validateRequest(updateAllocationsSchema), controller.updateAllocations);
router.delete("/:salesOrderId/requirements/:reqId", authenticateUser, controller.deleteRequirementLine);

export default router;
