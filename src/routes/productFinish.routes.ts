import express from "express";
import * as productFinishController from "../controllers/productFinish.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/")
    .all(authenticateUser)
    .post(productFinishController.createFinish)
    .get(productFinishController.getAllFinishes);

router.route("/:id")
    .all(authenticateUser)
    .get(productFinishController.getFinishById)
    .put(productFinishController.updateFinish)
    .delete(productFinishController.removeFinish);

export default router;