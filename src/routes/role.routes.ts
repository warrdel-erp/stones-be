import { Router } from "express";
import * as roleController from "../controllers/role.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator";

const router = Router();

router.get("/", authenticateUser, roleController.getRoles);
router.get("/:id", authenticateUser, roleController.getRoleById);
router.post("/", authenticateUser, validateRequest(createRoleSchema), roleController.createRole);
router.put("/:id", authenticateUser, validateRequest(updateRoleSchema), roleController.updateRole);
router.delete("/:id", authenticateUser, roleController.deleteRole);

export default router;
