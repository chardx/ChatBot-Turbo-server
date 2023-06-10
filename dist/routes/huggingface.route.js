import express from "express";
import fs from "fs";
const router = express.Router();
import { HfInference } from "@huggingface/inference";
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
// const directoryPath = "./src/routest/test";
// const directoryContents = fs.readdirSync(directoryPath);
// console.log(directoryContents);
router.route("/").post(async (req, res) => {
    const { prompt: input } = req.body;
    try {
        const results = await runHuggingFaceInference(req, input);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runHuggingFaceInference = async (req, input) => {
    //   const results = await hf.textToImage({
    //     inputs:
    //       "award winning high resolution photo of a giant tortoise/((ladybird)) hybrid, [trending on artstation]",
    //     model: "stabilityai/stable-diffusion-2",
    //     parameters: {
    //       negative_prompt: "blurry",
    //     },
    //   });
    //   const results = await hf.conversational({
    //     model: "microsoft/DialoGPT-large",
    //     inputs: {
    //       past_user_inputs: ["Who's the most handsome?"],
    //       generated_responses: ["It's Richard Roxas for sure"],
    //       text: "Can you explain why ?",
    //     },
    //   });
    const results = await hf.imageToText({
        data: fs.readFileSync("./src/routes/test/wallpapersden.com_monkey-luffy-gear-5-art-one-piece_wxl.jpg"),
        model: "nlpconnect/vit-gpt2-image-captioning",
    });
    console.log(results);
    return results;
};
export default router;
//# sourceMappingURL=huggingface.route.js.map