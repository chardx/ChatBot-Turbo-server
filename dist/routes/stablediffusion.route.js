import express from "express";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import * as dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
router.route("/").get(async (req, res) => {
    res.write("<h1>Stable Diffusion Routes<h1>");
    res.send();
});
router.route("/").post(async (req, res) => {
    try {
        const results = await runProcessImage(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runProcessImage = async (req) => {
    const model = new OpenAI({ temperature: 0 });
    const tools = [new StableDiffusionTool()];
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "zero-shot-react-description",
        verbose: true,
    });
    console.log("Loaded Stable diffusion agent.");
    // const input = "Generate an image of A Flying car";
    const { prompt: input } = req.body;
    console.log(input);
    console.log(`Executing with input "${input}"...`);
    //Run the agent
    try {
        const result = await executor.call({ input });
        console.log(`Got output ${result.output}`);
        console.log(result);
        return result.output;
    }
    catch (error) {
        console.log(error);
        return error;
    }
};
export default router;
class StableDiffusionTool extends DynamicTool {
    constructor() {
        super({
            name: "StableDiffusion",
            description: "A custom tool that uses the Stable Diffusion API to generate images",
            func: async (input) => {
                console.log("input: " + input);
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
                    return `data:image/jpeg;base64,${base64Image}`;
                }
                catch (error) {
                    console.log("error was called!");
                    console.log(error);
                }
            },
        });
    }
}
//# sourceMappingURL=stablediffusion.route.js.map