import { Router } from "express";
import {
  uploadImage,
  uploadImages,
  deleteImage,
  listMedia,
} from "../controllers/upload.controller";
import { verifyToken } from "../middleware/auth";
import { createUploader, S3Folder } from "../config/s3";

const router = Router();

// All upload routes require auth
router.use(verifyToken);

/** Single image upload to a specific folder */
router.post("/image", (req, res, next) => {
  const folder = (req.query.folder as S3Folder) || "general";
  const upload = createUploader(folder);
  upload.single("image")(req, res, (err) => {
    if (err) return next(err);
    uploadImage(req, res, next);
  });
});

/** Multiple images upload */
router.post("/images", (req, res, next) => {
  const folder = (req.query.folder as S3Folder) || "general";
  const upload = createUploader(folder);
  upload.array("images", 10)(req, res, (err) => {
    if (err) return next(err);
    uploadImages(req, res, next);
  });
});

/** Delete image from S3 */
router.delete("/image", deleteImage);

/** List all media (media library) */
router.get("/media", listMedia);

export default router;
