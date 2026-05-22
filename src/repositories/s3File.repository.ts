import { FILE_UPLOAD_STATUS } from "../constants/tableTypes";
import * as models from "../models";

// Create a new S3 file record
export const createS3File = async (data: {
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
  isTemp: boolean;
  uploadedById?: number | null;
}) => {
  return models.S3File.create(data as any);
};

// Find S3 file record by primary key
export const findS3FileById = async (id: number) => {
  return models.S3File.findByPk(id);
};

// Find S3 file record by UUID
export const findS3FileByUuid = async (uuid: string) => {
  return models.S3File.findOne({ where: { uuid } });
};

// Update the status of an S3 file record
export const updateS3FileStatus = async (
  id: number,
  status: (typeof FILE_UPLOAD_STATUS)[keyof typeof FILE_UPLOAD_STATUS]
) => {
  const [updatedCount] = await models.S3File.update({ status }, { where: { id } });
  if (updatedCount === 0) return null;
  return models.S3File.findByPk(id);
};

// List all S3 file records for a tenant with optional entity filter
export const findAllS3Files = async (
  clientId: number,
  filters: { entityType?: string; entityId?: number; status?: string } = {}
) => {
  const where: Record<string, any> = { clientId };

  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.status) where.status = filters.status;

  return models.S3File.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
};

// Mark an S3 file as permanent by setting isTemp = false
// Call this when an entity (e.g. customer) permanently claims the file
export const markS3FilePermanent = async (id: number, transaction?: any) => {
  await models.S3File.update({ isTemp: false }, { where: { id }, transaction });
};
