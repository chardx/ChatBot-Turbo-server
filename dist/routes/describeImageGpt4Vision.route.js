import express from "express";
const router = express.Router();
import OpenAI from "openai";
const openai = new OpenAI();
router.route("/").post(async (req, res) => {
    const { imageUrl } = req.body;
    try {
        const results = await runGPT4Vision(req, imageUrl);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runGPT4Vision = async (req, imageUrl) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "What’s in this image?" },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl,
                        },
                    },
                ],
            },
        ],
        max_tokens: 300,
    });
    console.log(`Total Token cost ${response.usage.total_tokens}`);
    const generatedResult = response.choices[0].message.content;
    console.log(generatedResult);
    return generatedResult;
};
export default router;
//# sourceMappingURL=describeImageGpt4Vision.route.js.map