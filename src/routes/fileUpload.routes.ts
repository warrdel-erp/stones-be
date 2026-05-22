import { Router } from "express";
import * as fileUploadController from "../controllers/fileUpload.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { generateUploadUrlSchema } from "../validators/fileUpload.validator";

const router = Router();

// Generate a pre-signed S3 PUT URL and create a pending upload record
router.post(
  "/generateUrl",
  authenticateUser,
  validateRequest(generateUploadUrlSchema),
  fileUploadController.generateUploadUrlController
);

// Confirm a file upload (HeadObject check → status: active)
router.post(
  "/confirm/:id",
  authenticateUser,
  fileUploadController.confirmUploadController
);

// List all file uploads for the authenticated tenant
router.get(
  "/",
  authenticateUser,
  fileUploadController.listFileUploadsController
);

// Get a single file upload by ID
router.get(
  "/:id",
  authenticateUser,
  fileUploadController.getFileUploadByIdController
);

export default router;
