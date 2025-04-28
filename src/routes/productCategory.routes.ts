import { Router } from "express";
import {
    createProductCategory,
    getAllProductCategories,
    getProductCategory,
    updateProductCategory,
    deleteProductCategory,
} from "../controllers/productCategory.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.route("/")
    .all(authenticateUser)
    .post(createProductCategory)
    .get(getAllProductCategories);

router.route("/:id")
    .all(authenticateUser)
    .get(getProductCategory)
    .put(updateProductCategory)
    .delete(deleteProductCategory);

export default router;
