import express from "express";
import fileUpload from "express-fileupload";

//path for __dirname using module
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import filesPayloadExists from "./middleware/filePayloadExists.js";
import fileExtLimiter from "./middleware/fileExtLimiter.js";
import fileSizeLimiter from "./middleware/fileSizeLimiter.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.write("<h1>File Uploader Routes</h1>");
  console.log(__dirname);
  res.send();
});

router
  .route("/")
  .post(
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([
      ".png",
      ".jpg",
      ".jpeg",
      ".pdf",
      ".txt",
      ".csv",
      ".json",
      ".mp3",
    ]),
    fileSizeLimiter,
    async (req: any, res) => {
      const files = req.files;
      console.log(files);

      Object.keys(files).forEach((key) => {
        let directoryPath = "document-loader/documents";
        let fileName = files[key].name;
        if (files[key].mimetype === "audio/mpeg") {
          // Store mp3 file to different directory
          directoryPath = "audioToTranscribe/";
          fileName = "index.mp3"; // Default mp3 file
        }
        const parentPath = path.resolve(__dirname, "..");
        const filepath = join(parentPath, directoryPath, fileName);
        files[key].mv(filepath, (err) => {
          if (err)
            return res.status(500).json({ status: "error", message: err });
        });
      });
      console.log("Upload success!!");

      return res.json({
        status: "success",
        message: Object.keys(files).toString(),
      });
    }
  );

export default router;
