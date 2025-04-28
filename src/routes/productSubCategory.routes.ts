import { Router } from "express";
import {
    createProductSubCategory,
    getAllProductSubCategories,
    getProductSubCategory,
    updateProductSubCategory,
    deleteProductSubCategory,
} from "../controllers/productSubCategory.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

router.route("/")
    .all(authenticateUser)
    .post(createProductSubCategory)
    .get(getAllProductSubCategories);

router.route("/:id")
    .all(authenticateUser)
    .get(getProductSubCategory)
    .put(updateProductSubCategory)
    .delete(deleteProductSubCategory);

export default router;