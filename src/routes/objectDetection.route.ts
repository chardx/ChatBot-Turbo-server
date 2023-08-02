import express from "express";
const router = express.Router();
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

router.route("/").post(async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const results = await runObjectDetection(req, imageUrl);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runObjectDetection = async (req: any, imageUrl: Blob | any) => {
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();

  //List of Image to Text Models
  // nlpconnect/vit-gpt2-image-captioning",  //Salesforce/blip-image-captioning-large
  try {
    const results = await hf.objectDetection({
      data: imageBlob,
      model: "facebook/detr-resnet-50", //Salesforce/blip-image-captioning-large
    });

    // const generatedText = results.generated_text;
    console.log("Generated Text");
    console.log(results);

    return results;
  } catch (error) {
    console.log(error);
  }
};

export default router;
