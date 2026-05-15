import { Router } from "express";
import { ingestCsv } from "../services/csv-ingestion.service";
import multer from "multer";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    await ingestCsv(req.file.path);

    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      uploadedFile: req.file.filename,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

export default router;
