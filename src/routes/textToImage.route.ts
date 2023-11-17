import express from "express";
import OpenAI from "openai";

const openai = new OpenAI();
import { uploadImage } from "../functions/cloudinary.js";
const router = express.Router();

router.route("/").post(async (req, res) => {
  const { prompt: input } = req.body;
  try {
    const results = await runTextToImage(req, input);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runTextToImage = async (req: any, input: string) => {
  try {
    const response: any = await openai.images.generate({
      model: "dall-e-3",
      prompt: input,
      n: 1,
      size: "1024x1024",
    });
    console.log(response);
    const image_url = response.data[0].url;

    // //Upload Image to Cloudinary
    const urlResult = await uploadImage(image_url);
    return urlResult;
  } catch (error) {
    console.log("error was called!");
    console.log(error);
  }
};
export default router;
