import express from "express";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { Calculator } from "langchain/tools/calculator";
import { SerpAPI } from "langchain/tools";
import { WebBrowser } from "langchain/tools/webbrowser";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import * as dotenv from "dotenv";
dotenv.config();
const router = express.Router();
router.route("/").get(async (req, res) => {
    res.write("<h1>Welcome to Google Search Routes<h1>");
    res.send();
});
router.route("/").post(async (req, res) => {
    try {
        const results = await runGoogleSearch(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runGoogleSearch = async (req) => {
    //Instantiante the OpenAI model
    //Pass the "temperature" parameter which controls the RANDOMNESS of the model's output. A lower temperature will result in more predictable output, while a higher temperature will result in more random output. The temperature parameter is set between 0 and 1, with 0 being the most predictable and 1 being the most random
    const model = new OpenAI({ temperature: 0 });
    //Load the embeddings
    const embeddings = new OpenAIEmbeddings();
    //Create a list of the instatiated tools
    const tools = [
        new SerpAPI(),
        new Calculator(),
        new WebBrowser({ model, embeddings }),
    ];
    //Construct an agent from an LLM and a list of tools
    //"zero-shot-react-description" tells the agent to use the ReAct framework to determine which tool to use. The ReAct framework determines which tool to use based solely on the tool’s description. Any number of tools can be provided. This agent requires that a description is provided for each tool.
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "zero-shot-react-description",
        verbose: true,
    });
    console.log("Loaded agent.");
    //Specify the prompt
    console.log(req.body.prompt);
    const { prompt: input } = req.body;
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
//# sourceMappingURL=google.route.js.map