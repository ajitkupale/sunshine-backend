import { Request, Response, NextFunction } from "express";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { s3Client, getS3Url } from "../config/s3";
import { env } from "../config/env";
import { createError } from "../middleware/errorHandler";

/**
 * POST /api/upload/image
 * Single image upload — file is already on S3 via multer-s3 by this point.
 * This controller just returns the URL.
 */
export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(createError("No file uploaded", 400));
    }

    // multer-s3 puts the S3 key on req.file.key
    const file = req.file as Express.MulterS3.File;
    const url = getS3Url(file.key);

    res.status(201).json({
      success: true,
      data: {
        url,
        key: file.key,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/upload/images
 * Multiple images upload.
 */
export async function uploadImages(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next(createError("No files uploaded", 400));
    }

    const files = req.files as Express.MulterS3.File[];
    const uploaded = files.map((file) => ({
      url: getS3Url(file.key),
      key: file.key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(201).json({ success: true, data: uploaded });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/upload/image
 * Delete an image from S3 by its key.
 */
export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = req.body;
    if (!key) return next(createError("Image key is required", 400));

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      })
    );

    res.json({ success: true, message: "Image deleted from S3" });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/upload/media
 * List all objects in the S3 bucket (for media library).
 */
export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const folder = (req.query.folder as string) || "";
    const prefix = folder ? `${folder}/` : "";

    const command = new ListObjectsV2Command({
      Bucket: env.AWS_S3_BUCKET,
      Prefix: prefix,
      MaxKeys: 200,
    });

    const result = await s3Client.send(command);

    const files = (result.Contents || [])
      .filter((obj) => obj.Key && !obj.Key.endsWith("/")) // exclude folder placeholders
      .map((obj) => ({
        key: obj.Key!,
        url: getS3Url(obj.Key!),
        size: obj.Size,
        lastModified: obj.LastModified,
      }));

    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
}
