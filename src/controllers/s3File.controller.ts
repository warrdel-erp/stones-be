import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as s3FileService from "../services/s3File.service";

// POST /api/fileUpload/generateUrl
export const generateUploadUrlController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  const result = await s3FileService.generateUploadUrl(req.body, {
    id: user.id,
    clientId: user.clientId,
    accountId: user.accountId,
  });

  return SuccessResponse(res, 200, "Pre-signed upload URL generated successfully.", result);
});

// POST /api/fileUpload/confirm/:id
export const confirmUploadController = catchAsync(async (req: AuthRequest, res: Response) => {
  const fileId = parseInt(req.params.id, 10);

  if (isNaN(fileId)) {
    throw new AppError("Invalid file ID.", 400);
  }

  const updated = await s3FileService.confirmUpload(fileId, req.user!.clientId);

  return SuccessResponse(res, 200, "File upload confirmed successfully.", updated);
});

// GET /api/fileUpload/:id
export const getS3FileByIdController = catchAsync(async (req: AuthRequest, res: Response) => {
  const fileId = parseInt(req.params.id, 10);

  if (isNaN(fileId)) {
    throw new AppError("Invalid file ID.", 400);
  }

  const s3File = await s3FileService.getS3FileById(fileId, req.user!.clientId);

  return SuccessResponse(res, 200, "S3 file retrieved successfully.", s3File);
});

// GET /api/fileUpload/
export const listS3FilesController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { entityType, entityId, status } = req.query;

  const filters: Record<string, any> = {};
  if (entityType) filters.entityType = String(entityType);
  if (entityId) filters.entityId = parseInt(String(entityId), 10);
  if (status) filters.status = String(status);

  const s3Files = await s3FileService.listS3Files(req.user!.clientId, filters);

  return SuccessResponse(res, 200, "S3 files retrieved successfully.", s3Files);
});
