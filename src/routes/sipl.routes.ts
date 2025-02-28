import { Router } from "express";
import * as siplController from "../controllers/sipl.controller";

const router = Router();

// Receive all slabs in an SIPL in inventory.
router.put("/:id/receiveInventory", siplController.receiveInventoryController);

// Create SIPL against PO.
router.post("/createSipl", siplController.createSIPLController);

// Create SIPL against PO.
router.post("/createDirectSipl", siplController.createDirectSIPLController);

// add slab to SIPL.
router.post("/:id/addSlab", siplController.createSlabHandler);

export default router;
