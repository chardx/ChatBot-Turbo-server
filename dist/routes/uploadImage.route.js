import express from "express";
import { uploadImage } from "../functions/cloudinary.js";
const router = express.Router();
router.route("/").post(async (req, res) => {
    const { imageBlob } = req.body;
    try {
        const results = await runUploadImage(req, imageBlob);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runUploadImage = async (req, imageBlob) => {
    try {
        const imageUrl = await uploadImage(imageBlob);
        console.log("IMage url");
        console.log(imageUrl);
        return imageUrl;
    }
    catch (error) {
        console.log("error was called!");
        console.log(error);
    }
};
export default router;
//# sourceMappingURL=uploadImage.route.js.map