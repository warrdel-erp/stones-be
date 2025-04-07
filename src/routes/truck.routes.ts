import { Router } from "express";
import {
  createTruckController,
  getAllTrucksController,
  getTruckByIdController,
  updateTruckController,
  deleteTruckController,
} from "../controllers/truck.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Create Truck
router.post("/", authenticateUser, createTruckController);

// get all trucks
router.get("/", authenticateUser, getAllTrucksController);

// Get truck detail by Id
router.get("/:id", authenticateUser, getTruckByIdController);

// update truck
router.put("/:id", authenticateUser, updateTruckController);

// Delete truck
router.delete("/:id", authenticateUser, deleteTruckController);

export default router;
