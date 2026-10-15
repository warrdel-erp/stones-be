import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createAreaSchema, updateAreaSchema } from "../validators/area.validator";
import {
  createArea,
  deleteArea,
  getAreas,
  getAreaById,
  getAreasByWarehouse,
  updateArea,
} from "../controllers/area.controller";

const router = Router();

router.use(authenticateUser);

router.post("/", validateRequest(createAreaSchema), createArea);
router.get("/", getAreas);
router.get("/warehouse/:warehouseId", getAreasByWarehouse);
router.get("/:id", getAreaById);
router.put("/:id", validateRequest(updateAreaSchema), updateArea);
router.delete("/:id", deleteArea);

export default router;
