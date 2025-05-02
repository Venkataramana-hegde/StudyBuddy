// src/services/mobile/fileUpload.route.js

import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { promisify } from "util";

// Set up Multer to handle file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for files
});

const router = express.Router();

// Cloudinary setup
cloudinary.config({
  cloud_name: "your_cloud_name",
  api_key: "your_api_key",
  api_secret: "your_api_secret",
});

// File upload route
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Upload to Cloudinary
    const uploadToCloudinary = promisify(cloudinary.v2.uploader.upload_stream);
    const result = await uploadToCloudinary(req.file.buffer);

    // Save result.url (Cloudinary URL) to the message in MongoDB or as needed
    return res.json({
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
