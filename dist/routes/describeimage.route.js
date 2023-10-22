import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai";
const router = express.Router();
import { HfInference } from "@huggingface/inference";
const chat = new ChatOpenAI({ temperature: 0 });
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
// const directoryPath = "./src/routest/test";
// const directoryContents = fs.readdirSync(directoryPath);
// console.log(directoryContents);
router.route("/").post(async (req, res) => {
    const { imageUrl } = req.body;
    try {
        const results = await runDescribeImage(req, imageUrl);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runDescribeImage = async (req, imageUrl) => {
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    //List of Image to Text Models
    // nlpconnect/vit-gpt2-image-captioning",  //Salesforce/blip-image-captioning-large
    try {
        const results = await hf.imageToText({
            data: imageBlob,
            model: "Salesforce/blip-image-captioning-large", //Salesforce/blip-image-captioning-large
        });
        const generatedText = results.generated_text;
        console.log("Generated Text");
        console.log(results.generated_text);
        // const response = await chat.call([
        //   new SystemChatMessage(`
        //   Act like you're a bot that that explain a description of an image further but in full details but still stay with the context of the given description. No introduction and side comments. Just provide your observation.
        //   `),
        //   new HumanChatMessage(results.generated_text),
        // ]);
        return generatedText;
    }
    catch (error) {
        console.log(error);
    }
};
export default router;
//# sourceMappingURL=describeimage.route.js.map