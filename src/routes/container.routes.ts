import { Router } from "express";
import * as containerController from "../controllers/container.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// router.post("/", authenticateUser, containerController.createContainer);

// router.get("/", authenticateUser, containerController.getAllContainers);

// router.get("/:id", authenticateUser, containerController.getContainerById);

router.put("/:id", authenticateUser, containerController.updateContainer);

router.delete("/:id", authenticateUser, containerController.deleteContainer);

export default router;
