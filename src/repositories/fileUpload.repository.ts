import { FILE_UPLOAD_STATUS } from "../constants/tableTypes";
import * as models from "../models";

// Create a new file upload record
export const createFileUpload = async (data: {
  uuid: string;
  s3Key: string;
  s3Bucket: string;
  entityType?: string | null;
  entityId?: number | null;
  companyId?: number | null;
  clientId: number;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById?: number | null;
}) => {
  return models.FileUpload.create(data as any);
};

// Find file upload by primary key
export const findFileUploadById = async (id: number) => {
  return models.FileUpload.findByPk(id);
};

// Find file upload by UUID
export const findFileUploadByUuid = async (uuid: string) => {
  return models.FileUpload.findOne({ where: { uuid } });
};

// Update the status of a file upload
export const updateFileUploadStatus = async (
  id: number,
  status: (typeof FILE_UPLOAD_STATUS)[keyof typeof FILE_UPLOAD_STATUS]
) => {
  const [updatedCount] = await models.FileUpload.update({ status }, { where: { id } });
  if (updatedCount === 0) return null;
  return models.FileUpload.findByPk(id);
};

// List all file uploads for a tenant with optional entity filter
export const findAllFileUploads = async (
  clientId: number,
  filters: { entityType?: string; entityId?: number; status?: string } = {}
) => {
  const where: Record<string, any> = { clientId };

  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.status) where.status = filters.status;

  return models.FileUpload.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
};
