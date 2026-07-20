import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET, S3_KEY_PREFIX, SIGNED_URL_EXPIRES_IN } from "../config/s3";
import { AppError } from "../helper/appError";
import { FILE_UPLOAD_STATUS, FILE_UPLOAD_ENTITY_TYPE } from "../constants/tableTypes";
import * as s3FileRepo from "../repositories/s3File.repository";
import * as productRepository from "../repositories/product.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { Transaction } from "sequelize";

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
 * Generates a pre-signed S3 PUT URL and creates a pending S3File record.
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
    isTemp?: boolean;
    entityType: string;
    entityId?: number | null;
    companyId?: number | null;
  },
  user: { id: number; clientId: number; accountId: number }
) => {
  const { originalName, mimeType, size, isTemp = false, entityType, entityId, companyId } = data;

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

  // Extract extension from originalName or map from mimeType
  let ext = "";
  const lastDotIndex = originalName.lastIndexOf(".");
  if (lastDotIndex !== -1 && lastDotIndex < originalName.length - 1) {
    ext = originalName.slice(lastDotIndex).toLowerCase();
  }
  if (!ext) {
    const mimeMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
      "image/bmp": ".bmp",
      "image/tiff": ".tiff",
    };
    ext = mimeMap[mimeType] || "";
  }

  // Generate UUID-based S3 key (no business logic in key)
  // Key format: {env}/{clientId}/{uuid}{ext}  — env is "prod" in production, "stage" everywhere else
  const envPrefix = process.env.NODE_ENV === "production" ? "prod" : "stage";
  const uuid = uuidv4();
  const baseKey = `${envPrefix}/${user.clientId}/${uuid}${ext}`;
  const prefix = S3_KEY_PREFIX ? (S3_KEY_PREFIX.endsWith('/') ? S3_KEY_PREFIX : `${S3_KEY_PREFIX}/`) : "";
  const s3Key = `${prefix}${baseKey}`;

  // Create the pending DB record before issuing the URL
  const s3File = await s3FileRepo.createS3File({
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
    isTemp,
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
    fileId: (s3File as any).id,
    uuid,
    s3Key,
    expiresIn: SIGNED_URL_EXPIRES_IN,
  };
};

/**
 * Confirms that a file was successfully uploaded to S3.
 * Runs HeadObject to verify file existence, then marks status as "active".
 *
 * @param fileId - ID of the S3File record to confirm
 * @param clientId - Must match the record's clientId (access control)
 * @returns Updated S3File record
 */
export const confirmUpload = async (fileId: number, clientId: number) => {
  const s3File = await s3FileRepo.findS3FileById(fileId);

  if (!s3File) {
    throw new AppError("S3 file record not found.", 404);
  }

  // Access control — ensure record belongs to caller's tenant
  if ((s3File as any).clientId !== clientId) {
    throw new AppError("Access denied. You do not have permission to confirm this upload.", 403);
  }

  // Idempotency — do not allow confirming an already-active record
  if ((s3File as any).status === FILE_UPLOAD_STATUS.ACTIVE) {
    throw new AppError("This file has already been confirmed.", 400);
  }

  if ((s3File as any).status === FILE_UPLOAD_STATUS.FAILED) {
    throw new AppError("This file is in a failed state and cannot be confirmed.", 400);
  }

  // Verify file exists in S3 via HeadObject
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: (s3File as any).s3Bucket,
      Key: (s3File as any).s3Key,
    });
    await s3Client.send(headCommand);
  } catch (err: any) {
    // Mark as failed if the file is not found in S3
    await s3FileRepo.updateS3FileStatus(fileId, FILE_UPLOAD_STATUS.FAILED);
    throw new AppError(
      "File not found in S3. Please re-upload the file before confirming.",
      400
    );
  }

  // Mark as active
  const updated = await s3FileRepo.updateS3FileStatus(fileId, FILE_UPLOAD_STATUS.ACTIVE);
  const s3FileRecord = updated as any;
  
  if (s3FileRecord.entityType === FILE_UPLOAD_ENTITY_TYPE.INVENTORY_PRODUCT && s3FileRecord.entityId) {
    try {
      const inventoryProductId = s3FileRecord.entityId;
      const images = await inventoryProductRepository.getInventoryProductImagesByInventoryProductId(inventoryProductId);
      const exists = images.some((img: any) => img.s3FileId === fileId);

      if (!exists) {
        const count = images.length;
        const isPrimary = count === 0;
        await inventoryProductRepository.createInventoryProductImage(inventoryProductId, fileId, isPrimary);
      }
      // Mark file as permanent since it's now linked to an inventory product
      await s3FileRepo.markS3FilePermanent(fileId);
    } catch (error) {
      console.error("Failed to link inventory product image upon S3 confirmation:", error);
    }
  }

  if (s3FileRecord.entityType === FILE_UPLOAD_ENTITY_TYPE.PRODUCT && s3FileRecord.entityId) {
    try {
      const productId = s3FileRecord.entityId;
      const images = await productRepository.getProductImagesByProductId(productId);
      const exists = images.some((img: any) => img.s3FileId === fileId);

      if (!exists) {
        const count = images.length;
        const isPrimary = count === 0;
        await productRepository.createProductImage(productId, fileId, isPrimary);
      }
      // Mark file as permanent since it's now linked to a product
      await s3FileRepo.markS3FilePermanent(fileId);
    } catch (error) {
      console.error("Failed to link product image upon S3 confirmation:", error);
    }
  }

  return updated;
};

/**
 * Fetches a single S3File record by ID, scoped to a tenant.
 */
export const getS3FileById = async (fileId: number, clientId: number) => {
  const s3File = await s3FileRepo.findS3FileById(fileId);

  if (!s3File) {
    throw new AppError("S3 file record not found.", 404);
  }

  if ((s3File as any).clientId !== clientId) {
    throw new AppError("Access denied.", 403);
  }

  const plain = s3File.get({ plain: true }) as any;
  if (plain.s3Bucket && plain.s3Key) {
    plain.url = await generateSignedGetUrl(plain.s3Bucket, plain.s3Key);
  }
  return plain;
};

/**
 * Generates a signed GET URL for downloading/viewing a file from S3
 */
export const generateSignedGetUrl = async (bucket: string, key: string): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRES_IN });
};

/**
 * Lists all S3File records for a tenant, with optional filters.
 */
export const listS3Files = async (
  clientId: number,
  filters: { entityType?: string; entityId?: number; status?: string } = {}
) => {
  return s3FileRepo.findAllS3Files(clientId, filters);
};

/**
 * Deletes an S3File record and its corresponding object in S3.
 */
export const deleteS3File = async (fileId: number, transaction?: Transaction) => {
  const s3File = await s3FileRepo.findS3FileById(fileId);
  if (!s3File) return;

  const plain = s3File.get({ plain: true }) as any;
  if (plain.s3Bucket && plain.s3Key) {
    const command = new DeleteObjectCommand({ Bucket: plain.s3Bucket, Key: plain.s3Key });
    await s3Client.send(command);
  }

  await s3File.destroy({ transaction });
};

/**
 * Explores the S3 bucket and returns all objects with nesting of keys.
 */
export const exploreS3Bucket = async () => {
  if (!S3_BUCKET) {
    throw new AppError("S3 bucket is not configured.", 500);
  }

  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
  });

  try {
    const result = await s3Client.send(command);
    return result.Contents?.map(item => ({
      Key: item.Key,
      Size: item.Size,
      LastModified: item.LastModified,
      ETag: item.ETag,
    })) || [];
  } catch (err: any) {
    throw new AppError("Failed to fetch S3 bucket contents.", 500);
  }
};

/**
 * Gets a signed URL for a specific key in the S3 bucket.
 */
export const getExploreSignedUrl = async (key: string) => {
  if (!S3_BUCKET) {
    throw new AppError("S3 bucket is not configured.", 500);
  }
  return generateSignedGetUrl(S3_BUCKET, key);
};

/**
 * Deletes an array of keys from the S3 bucket.
 */
export const deleteExploreKeys = async (keys: string[]) => {
  if (!S3_BUCKET) {
    throw new AppError("S3 bucket is not configured.", 500);
  }

  for (const key of keys) {
    if (!key || key.trim() === '') continue;

    // Delete the exact key (could be a file or an explicit empty folder marker)
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));

    // Treat it as a folder prefix and recursively delete all contents
    const prefix = key.endsWith('/') ? key : `${key}/`;
    
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      const listResult: any = await s3Client.send(listCommand);

      if (listResult.Contents && listResult.Contents.length > 0) {
        const objectsToDelete = listResult.Contents.map((obj: any) => ({ Key: obj.Key }));
        
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: { Objects: objectsToDelete, Quiet: true },
        });
        
        await s3Client.send(deleteCommand);
      }

      isTruncated = listResult.IsTruncated ?? false;
      continuationToken = listResult.NextContinuationToken;
    }
  }
};

/**
 * Creates a new folder (empty object with trailing slash) in the S3 bucket.
 */
export const createExploreFolder = async (folderKey: string) => {
  if (!S3_BUCKET) {
    throw new AppError("S3 bucket is not configured.", 500);
  }

  // Ensure the key ends with a slash to represent a folder in S3
  const key = folderKey.endsWith("/") ? folderKey : `${folderKey}/`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: "",
  });

  await s3Client.send(command);
};


