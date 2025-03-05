import express from "express";
import * as requestedPurchaseProductController from "../controllers/requestedPurchaseProduct.controller";

const router = express.Router();

router.delete("/:id", requestedPurchaseProductController.deleteRequestedPurchaseProductController);

export default router;
