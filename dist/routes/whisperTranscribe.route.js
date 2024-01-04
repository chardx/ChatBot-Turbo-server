import express from "express";
import axios from "axios";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import FormData from "form-data";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
import OpenAI from "openai";
const openai = new OpenAI();
const mp3File = path.join(__dirname, "audioToTranscribe/sample.mp3");
router.route("/").post(async (req, res) => {
    const { imageUrl } = req.body;
    try {
        const results = await runWhisperTranscribe(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runWhisperTranscribe = async (req) => {
    console.log("sample mp3:" + mp3File);
    const apiUrl = "https://api.openai.com/v1/audio/transcriptions";
    const API_KEY = process.env.OPENAI_API_KEY;
    console.log(API_KEY);
    const formData = new FormData();
    const mp3Buffer = fs.readFileSync(mp3File);
    console.log("mp3Buffer");
    console.log(mp3Buffer);
    formData.append("file", mp3Buffer, "sample.mp3");
    formData.append("model", "whisper-1");
    console.log("FOrm data");
    console.log(formData);
    try {
        const response = await axios.post(apiUrl, formData, {
            headers: {
                Authorization: "Bearer " + API_KEY,
                "Content-type": "multipart/form-data",
            },
        });
        console.log(`response: ${response}`);
        return response.data.text;
    }
    catch (error) {
        console.log(error);
    }
};
export default router;
//# sourceMappingURL=whisperTranscribe.route.js.map