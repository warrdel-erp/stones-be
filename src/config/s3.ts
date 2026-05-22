import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  console.warn("[S3] Warning: AWS credentials or region not fully configured. File upload features may not work.");
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET || "";

export const SIGNED_URL_EXPIRES_IN = parseInt(process.env.S3_SIGNED_URL_EXPIRES_IN || "900", 10); // seconds, default 15 min
