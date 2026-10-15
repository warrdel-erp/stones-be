import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import * as docNumberingController from "../controllers/documentNumbering.controller";
import { updateDocumentNumberingSchema } from "../validators/documentNumbering.validator";

const router = Router();

router.use(authenticateUser);

router.get("/", docNumberingController.getDocumentNumberingConfigs);
router.put("/:documentType", validateRequest(updateDocumentNumberingSchema), docNumberingController.updateDocumentNumberingConfig);

export default router;
