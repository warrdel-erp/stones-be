import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { FILE_UPLOAD_ENTITY_TYPE, FILE_UPLOAD_STATUS } from "../constants/tableTypes";
import Client from "./client.model";
import Account from "./Account.model";

const S3File = sequelize.define(
  "S3File",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
      comment: "UUID used as the S3 key segment",
    },
    s3Key: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    s3Bucket: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM(...Object.values(FILE_UPLOAD_ENTITY_TYPE)),
      allowNull: true,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    originalName: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    isTemp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If true, the file is considered temporary and may be cleaned up later",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FILE_UPLOAD_STATUS)),
      allowNull: false,
      defaultValue: FILE_UPLOAD_STATUS.PENDING,
    },
    uploadedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        const bucket = this.get("s3Bucket");
        const key = this.get("s3Key");
        if (!bucket || !key) return null;
        const region = process.env.AWS_REGION || "us-east-1";
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      },
    },
  },
  {
    tableName: "s3_files",
    timestamps: true,
    paranoid: true,
  }
);

export default S3File;
