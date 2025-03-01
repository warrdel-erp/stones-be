import express from "express";
import * as inventoryController from "../controllers/inventory.controller";

const router = express.Router();

router.get("/location/:locationId", inventoryController.getProductsByLocation);

export default router;
