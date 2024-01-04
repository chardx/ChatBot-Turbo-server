import express, { Request, Response } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
import OpenAI from "openai";
const openai = new OpenAI();

const mp3File = path.join(__dirname, "audioToTranscribe/index.mp3");

router.route("/").post(async (req: Request, res: Response) => {
  const { imageUrl } = req.body;
  try {
    const results = await runWhisperTranscribe(req);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runWhisperTranscribe = async (req: Request) => {
  const translation = await openai.audio.translations.create({
    file: fs.createReadStream(mp3File),
    model: "whisper-1",
  });
  console.log(translation.text);
  //Deleting file synchronously
  fs.unlinkSync(mp3File);
  return translation.text;
};

export default router;
