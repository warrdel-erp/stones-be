import express from "express";
import * as requestedPurchaseProductController from "../controllers/requestedPurchaseProduct.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.delete("/:id", authenticateUser, requestedPurchaseProductController.deleteRequestedPurchaseProductController);

export default router;
