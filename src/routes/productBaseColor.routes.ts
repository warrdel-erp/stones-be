import express from "express";
import * as ProductBaseColorController from "../controllers/productBaseColor.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/")
    .all(authenticateUser)
    .post(ProductBaseColorController.createProductBaseColor)
    .get(ProductBaseColorController.getAllProductBaseColors);

router.route("/:id")
    .all(authenticateUser)
    .get(ProductBaseColorController.getProductBaseColorById)
    .put(ProductBaseColorController.updateProductBaseColor)
    .delete(ProductBaseColorController.deleteProductBaseColor);

export default router;