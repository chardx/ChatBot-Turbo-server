import express from "express";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import * as dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const API_URL = "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4";
const headers = { Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}` };
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
    //Instantiante the OpenAI model
    //Pass the "temperature" parameter which controls the RANDOMNESS of the model's output. A lower temperature will result in more predictable output, while a higher temperature will result in more random output. The temperature parameter is set between 0 and 1, with 0 being the most predictable and 1 being the most random
    const model = new OpenAI({ temperature: 0 });
    //Create a list of the instatiated tools
    const tools = [new SerpAPI(), new Calculator()];
    //Construct an agent from an LLM and a list of tools
    //"zero-shot-react-description" tells the agent to use the ReAct framework to determine which tool to use. The ReAct framework determines which tool to use based solely on the tool’s description. Any number of tools can be provided. This agent requires that a description is provided for each tool.
    const executor = await initializeAgentExecutor(tools, model, "zero-shot-react-description");
    console.log("Loaded agent.");
    //Specify the prompt
    console.log(req.body.prompt);
    const { prompt: input } = req.body;
    console.log("prompt:" + input);
    console.log(input);
    //Run the agent
    try {
        const result = await executor.call({ input });
        console.log(`Got output ${result.output}`);
        return result.output;
    }
    catch (error) {
        console.log(error);
        return error;
    }
};
export default router;
//# sourceMappingURL=stablediffusion.route.js.map