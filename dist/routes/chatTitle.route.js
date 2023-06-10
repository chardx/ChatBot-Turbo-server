import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";
import * as dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const chat = new ChatOpenAI({ temperature: 0 });
router.route("/").get(async (req, res) => {
    res.write("<h1>Generate Title Routes</h1>");
    res.send();
});
router.route("/").post(async (req, res) => {
    try {
        const results = await runGenerateTitle(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const runGenerateTitle = async (req) => {
    const { messages } = req.body;
    const conversationToSummarize = await messages
        .slice(1)
        .map((m) => m.message)
        .join("\n");
    console.log(conversationToSummarize);
    const response = await chat.call([
        new HumanChatMessage(`Describe the following conversation snippet in 3 words or less. 
      >>>
      Hello
    ${conversationToSummarize}  
      >>>
      `),
    ]);
    console.log(response);
    return response;
};
export default router;
//# sourceMappingURL=chatTitle.route.js.map