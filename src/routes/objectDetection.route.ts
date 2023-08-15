import express from "express";
import Jimp from "jimp";

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

    console.log("Generated Text");
    console.log(results);
    await cropImages(imageUrl, results);

    return results;
  } catch (error) {
    console.log(error);
  }
};

export const cropImages = async (imageUrl, imageObjects) => {
  try {
    const croppedImages = [];
    for (let i = 0; i < imageObjects.length; i++) {
      console.log("hi");
      console.log(imageObjects[i]);
      const { xmin, ymin, xmax, ymax } = imageObjects[i].box;
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      const image = await Jimp.read(imageBuffer);
      image.crop(xmin, ymin, xmax - xmin, ymax - ymin);

      const croppedImageData = await image.getBufferAsync(Jimp.MIME_JPEG);
      const croppedImageBase64 = croppedImageData.toString("base64");

      croppedImages.push(croppedImageBase64);
      await runClassifyImage(croppedImageData);

      console.log(`Image ${i} cropped successfully!`);
    }

    // Do something with croppedImages array (e.g., send it to the frontend)
    // console.log(croppedImages);
  } catch (error) {
    console.error("Error cropping images:", error);
  }
};

const runClassifyImage = async (imageUrl: Blob | any) => {
  //List of Image to Text Models
  // nlpconnect/vit-gpt2-image-captioning",  //Salesforce/blip-image-captioning-large
  try {
    const results = await hf.imageClassification({
      data: imageUrl,
      model: "microsoft/resnet-50",
    });

    console.log("Generated Text");
    console.log(results);

    // const response = await chat.call([
    //   new SystemChatMessage(`
    //   Act like you're a bot that that explain a description of an image further but in full details but still stay with the context of the given description. No introduction and side comments. Just provide your observation.
    //   `),
    //   new HumanChatMessage(results.generated_text),
    // ]);

    // return generatedText;
  } catch (error) {
    console.log(error);
  }
};
export default router;
