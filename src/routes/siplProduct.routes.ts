import express from "express";
import * as siplProductController from "../controllers/siplProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.delete("/:id/deleteAll", authenticateUser, siplProductController.deleteAllItemsController);
router.delete("/:id", authenticateUser, siplProductController.deleteProductController);

export default router;
