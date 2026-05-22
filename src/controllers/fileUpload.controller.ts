import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as fileUploadService from "../services/fileUpload.service";

// POST /api/fileUpload/generateUrl
export const generateUploadUrlController = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  const result = await fileUploadService.generateUploadUrl(req.body, {
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

  const updated = await fileUploadService.confirmUpload(fileId, req.user!.clientId);

  return SuccessResponse(res, 200, "File upload confirmed successfully.", updated);
});

// GET /api/fileUpload/:id
export const getFileUploadByIdController = catchAsync(async (req: AuthRequest, res: Response) => {
  const fileId = parseInt(req.params.id, 10);

  if (isNaN(fileId)) {
    throw new AppError("Invalid file ID.", 400);
  }

  const fileUpload = await fileUploadService.getFileUploadById(fileId, req.user!.clientId);

  return SuccessResponse(res, 200, "File upload retrieved successfully.", fileUpload);
});

// GET /api/fileUpload/
export const listFileUploadsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { entityType, entityId, status } = req.query;

  const filters: Record<string, any> = {};
  if (entityType) filters.entityType = String(entityType);
  if (entityId) filters.entityId = parseInt(String(entityId), 10);
  if (status) filters.status = String(status);

  const fileUploads = await fileUploadService.listFileUploads(req.user!.clientId, filters);

  return SuccessResponse(res, 200, "File uploads retrieved successfully.", fileUploads);
});
