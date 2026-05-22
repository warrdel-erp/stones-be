import { Router } from "express";
import * as s3FileController from "../controllers/s3File.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { generateUploadUrlSchema } from "../validators/s3File.validator";

const router = Router();

// Generate a pre-signed S3 PUT URL and create a pending S3 file record
router.post(
  "/generateUrl",
  authenticateUser,
  validateRequest(generateUploadUrlSchema),
  s3FileController.generateUploadUrlController
);

// Confirm an S3 file upload (HeadObject check → status: active)
router.post(
  "/confirm/:id",
  authenticateUser,
  s3FileController.confirmUploadController
);

// List all S3 file records for the authenticated tenant
router.get(
  "/",
  authenticateUser,
  s3FileController.listS3FilesController
);

// Get a single S3 file record by ID
router.get(
  "/:id",
  authenticateUser,
  s3FileController.getS3FileByIdController
);

export default router;
