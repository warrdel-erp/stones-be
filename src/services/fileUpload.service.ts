import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET, SIGNED_URL_EXPIRES_IN } from "../config/s3";
import { AppError } from "../helper/appError";
import { FILE_UPLOAD_STATUS } from "../constants/tableTypes";
import * as fileUploadRepo from "../repositories/fileUpload.repository";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum allowed file size: 5 MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Image MIME types allowed for upload */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];

// ─── Service Functions ─────────────────────────────────────────────────────────

/**
 * Generates a pre-signed S3 PUT URL and creates a pending FileUpload record.
 *
 * @param data - Upload metadata provided by the client
 * @param user - Authenticated user making the request
 * @returns { uploadUrl, fileId, uuid, s3Key }
 */
export const generateUploadUrl = async (
  data: {
    originalName: string;
    mimeType: string;
    size: number;
    entityType?: string | null;
    entityId?: number | null;
    companyId?: number | null;
  },
  user: { id: number; clientId: number; accountId: number }
) => {
  const { originalName, mimeType, size, entityType, entityId, companyId } = data;

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(
      `Unsupported file type: "${mimeType}". Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      400
    );
  }

  // Validate file size
  if (size <= 0) {
    throw new AppError("File size must be greater than 0 bytes.", 400);
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new AppError(
      `File size ${(size / 1024 / 1024).toFixed(2)} MB exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
      400
    );
  }

  if (!S3_BUCKET) {
    throw new AppError("S3 bucket is not configured. Please contact the administrator.", 500);
  }

  // Generate UUID-based S3 key (no business logic in key)
  const uuid = uuidv4();
  const s3Key = `uploads/${user.clientId}/${uuid}`;

  // Create the pending DB record before issuing the URL
  const fileUpload = await fileUploadRepo.createFileUpload({
    uuid,
    s3Key,
    s3Bucket: S3_BUCKET,
    entityType: entityType || null,
    entityId: entityId || null,
    companyId: companyId || null,
    clientId: user.clientId,
    originalName,
    mimeType,
    size,
    uploadedById: user.accountId,
  });

  // Generate pre-signed PUT URL
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_EXPIRES_IN,
  });

  return {
    uploadUrl,
    fileId: (fileUpload as any).id,
    uuid,
    s3Key,
    expiresIn: SIGNED_URL_EXPIRES_IN,
  };
};

/**
 * Confirms that a file was successfully uploaded to S3.
 * Runs HeadObject to verify file existence, then marks status as "active".
 *
 * @param fileId - ID of the FileUpload record to confirm
 * @param clientId - Must match the record's clientId (access control)
 * @returns Updated FileUpload record
 */
export const confirmUpload = async (fileId: number, clientId: number) => {
  const fileUpload = await fileUploadRepo.findFileUploadById(fileId);

  if (!fileUpload) {
    throw new AppError("File upload record not found.", 404);
  }

  // Access control — ensure record belongs to caller's tenant
  if ((fileUpload as any).clientId !== clientId) {
    throw new AppError("Access denied. You do not have permission to confirm this upload.", 403);
  }

  // Idempotency — do not allow confirming an already-active record
  if ((fileUpload as any).status === FILE_UPLOAD_STATUS.ACTIVE) {
    throw new AppError("This file upload has already been confirmed.", 400);
  }

  if ((fileUpload as any).status === FILE_UPLOAD_STATUS.FAILED) {
    throw new AppError("This file upload is in a failed state and cannot be confirmed.", 400);
  }

  // Verify file exists in S3 via HeadObject
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: (fileUpload as any).s3Bucket,
      Key: (fileUpload as any).s3Key,
    });
    await s3Client.send(headCommand);
  } catch (err: any) {
    // Mark as failed if the file is not found in S3
    await fileUploadRepo.updateFileUploadStatus(fileId, FILE_UPLOAD_STATUS.FAILED);
    throw new AppError(
      "File not found in S3. Please re-upload the file before confirming.",
      400
    );
  }

  // Mark as active
  const updated = await fileUploadRepo.updateFileUploadStatus(fileId, FILE_UPLOAD_STATUS.ACTIVE);
  return updated;
};

/**
 * Fetches a single FileUpload record by ID, scoped to a tenant.
 */
export const getFileUploadById = async (fileId: number, clientId: number) => {
  const fileUpload = await fileUploadRepo.findFileUploadById(fileId);

  if (!fileUpload) {
    throw new AppError("File upload record not found.", 404);
  }

  if ((fileUpload as any).clientId !== clientId) {
    throw new AppError("Access denied.", 403);
  }

  return fileUpload;
};

/**
 * Lists all FileUpload records for a tenant, with optional filters.
 */
export const listFileUploads = async (
  clientId: number,
  filters: { entityType?: string; entityId?: number; status?: string } = {}
) => {
  return fileUploadRepo.findAllFileUploads(clientId, filters);
};
