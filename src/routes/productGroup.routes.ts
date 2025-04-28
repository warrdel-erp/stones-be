import express from "express";
import * as productGroupController from "../controllers/productGroup.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/")
    .all(authenticateUser)
    .post(productGroupController.createGroup)
    .get(productGroupController.getAllGroups);

router.route("/:id")
    .all(authenticateUser)
    .get(productGroupController.getGroupById)
    .put(productGroupController.updateGroup)
    .delete(productGroupController.removeGroup);

export default router;