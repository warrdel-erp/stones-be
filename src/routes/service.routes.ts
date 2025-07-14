import { Router } from "express";
import {
    createService,
    getAllServices,
    getService,
    updateService,
    deleteService,
} from "../controllers/service.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createServiceSchema, updateServiceSchema } from "../validators";

const router = Router();

router.route("/")
    .all(authenticateUser)
    .post(validateRequest(createServiceSchema), createService)
    .get(getAllServices);

router.route("/:id")
    .all(authenticateUser)
    .get(getService)
    .put(validateRequest(updateServiceSchema), updateService)
    .delete(deleteService);

export default router; 