import express from "express";
import * as accountPermissionController from "../controllers/accountPermission.controller";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/my", authenticateUser, accountPermissionController.getMyPermissions);

router.post("/update", authenticateUser, accountPermissionController.updatePermissions);

router.get("/:accountId", authenticateUser, accountPermissionController.getAccountPermissions);

export default router;
