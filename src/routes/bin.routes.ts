import { Router } from "express";
import * as binController from "../controllers/bin.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Get bins by Location (must be before /:id to avoid matching "location" as id)
router.get("/location/:locationId", authenticateUser, binController.getBinsByLocationController);

router
  .route("/")
  .all(authenticateUser)
  .post(binController.createBin)
  .get(binController.getAllBins);

router
  .route("/:id")
  .all(authenticateUser)
  .get(binController.getBin)
  .put(binController.updateBin)
  .delete(binController.deleteBin);

export default router;
