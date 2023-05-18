import express from "express";
import fileUpload from "express-fileupload";
import path from "path";

import filesPayloadExists from "./middleware/filePayloadExists.js";
import fileExtLimiter from "./middleware/fileExtLimiter.js";
import fileSizeLimiter from "./middleware/fileSizeLimiter.js";

const router = express.Router();

router.route("/").get(async (req, res) => {
  res.write("<h1>File Uploader Routes</h1>");

  res.send();
});

router
  .route("/")
  .post(
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    async (req: any, res) => {
      const files = req.files;
      console.log(files);

      Object.keys(files).forEach((key) => {
        const filepath = path.join(__dirname, "files", files[key].name);
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
