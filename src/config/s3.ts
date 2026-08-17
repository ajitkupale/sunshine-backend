import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { env } from "./env";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/** Returns the public URL of an S3 object */
export function getS3Url(key: string): string {
  if (env.AWS_CLOUDFRONT_URL) {
    return `${env.AWS_CLOUDFRONT_URL}/${key}`;
  }
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

/** Allowed image MIME types */
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Map of folder slugs to S3 prefix paths */
export const S3_FOLDERS = {
  hero: "hero",
  doctor: "doctor",
  facilities: "facilities",
  services: "services",
  og: "og",
  general: "general",
} as const;

export type S3Folder = keyof typeof S3_FOLDERS;

/**
 * Creates a multer-s3 upload middleware for a specific folder.
 * Files are streamed directly to S3 — no local disk usage.
 */
export function createUploader(folder: S3Folder = "general") {
  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: env.AWS_S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (_req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueKey = `${S3_FOLDERS[folder]}/${Date.now()}-${uuidv4()}${ext}`;
        cb(null, uniqueKey);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 10,
    },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIMETYPES.join(", ")}`));
      }
    },
  });
}
