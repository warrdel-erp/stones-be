import express from "express";
import * as siplProductController from "../controllers/siplProduct.controller";

const router = express.Router();

router.delete("/:id", siplProductController.deleteProductController);

export default router;
