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
    fileExtLimiter([".png", ".jpg", ".jpeg", ".pdf", ".txt", ".csv", ".json"]),
    fileSizeLimiter,
    async (req: any, res) => {
      const files = req.files;
      console.log(files);

      Object.keys(files).forEach((key) => {
        const parentPath = path.resolve(__dirname, "..");
        const filepath = join(
          parentPath,
          "document-loader/documents",
          files[key].name
        );
        files[key].mv(filepath, (err) => {
          if (err)
            return res.status(500).json({ status: "error", message: err });
        });
      });

      return res.json({
        status: "success",
        message: Object.keys(files).toString(),
      });
    }
  );

export default router;
