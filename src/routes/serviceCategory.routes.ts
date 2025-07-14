import { Router } from "express";
import {
    createServiceCategory,
    getAllServiceCategories,
    getServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
} from "../controllers/serviceCategory.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createServiceCategorySchema, updateServiceCategorySchema } from "../validators";

const router = Router();

router.route("/")
    .all(authenticateUser)
    .post(validateRequest(createServiceCategorySchema), createServiceCategory)
    .get(getAllServiceCategories);

router.route("/:id")
    .all(authenticateUser)
    .get(getServiceCategory)
    .put(validateRequest(updateServiceCategorySchema), updateServiceCategory)
    .delete(deleteServiceCategory);

export default router; 