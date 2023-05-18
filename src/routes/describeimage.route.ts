import express from "express";
import fs from "fs";

const router = express.Router();
import { HfInference } from "@huggingface/inference";
import { Url } from "url";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
// const directoryPath = "./src/routest/test";
// const directoryContents = fs.readdirSync(directoryPath);
// console.log(directoryContents);
router.route("/").post(async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const results = await runDescribeImage(req, imageUrl);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runDescribeImage = async (req: any, imageUrl: Blob | any) => {
  //   console.log(imageUrl);
  // 5. Fetch the image as a Blob

  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  console.log(imageBlob);

  // const regex = /^data:image\/(.*?);base64,/;
  // const match = imageUrl.match(regex);
  // const imageFormat = match ? match[1] : "";
  // const trimmedData = imageUrl.replace(regex, "");

  // console.log(trimmedData);

  try {
    const results = await hf.imageToText({
      data: imageBlob,
      model: "nlpconnect/vit-gpt2-image-captioning",
    });

    console.log(results);
    return results;
  } catch (error) {
    console.log(error);
  }
};

export default router;
