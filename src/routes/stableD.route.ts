import express from "express";
import { uploadImage } from "../functions/cloudinary.js";
const router = express.Router();

const huggingfaceModel = [
  {
    modelName: "Stable Diffusion 1.5 Original",
    endpointUrl:
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
  },
  {
    modelName: "Stability AI / Stable Diffuion 2-1",
    endpointUrl:
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
  },
  {
    modelName: "Prompt Hero / Open Journey",
    endpointUrl:
      "https://api-inference.huggingface.co/models/prompthero/openjourney",
  },
  {
    modelName: "Prompt Hero / Open Journey v4",
    endpointUrl:
      "https://api-inference.huggingface.co/models/prompthero/openjourney-v4",
  },

  {
    modelName: "Waifu Diffusion",
    endpointUrl:
      "https://api-inference.huggingface.co/models/hakurei/waifu-diffusion",
  },

  {
    modelName: "Kawai Diffusion v4-charm LTS", //best
    endpointUrl:
      "https://api-inference.huggingface.co/models/Ojimi/anime-kawai-diffusion",
  },
  {
    modelName: "Stable Diffusion rev-anim",
    endpointUrl:
      "https://api-inference.huggingface.co/models/stablediffusionapi/rev-anim",
  },
];

const API_URL = huggingfaceModel[6].endpointUrl;

router.route("/").post(async (req, res) => {
  const { prompt: input } = req.body;
  try {
    const results = await runProcessImage(req, input);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runProcessImage = async (req: any, input: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      },
      body: JSON.stringify(input),
    });
    // const blob = await response.blob();
    // console.log(blob);
    // console.log("Hey I was executed");
    // console.log(URL.createObjectURL(blob));
    // return `${URL.createObjectURL(blob)}`;

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    // console.log(`data:image/jpeg;base64,${base64Image}`);
    //Upload Image to Cloudinary
    const urlResult = await uploadImage(
      `data:image/jpeg;base64,${base64Image}`
    );
    return urlResult;
  } catch (error) {
    console.log("error was called!");
    console.log(error);
  }
};
export default router;
