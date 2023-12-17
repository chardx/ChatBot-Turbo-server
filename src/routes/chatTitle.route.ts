import express from "express";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

//Langchain implementation using Gemini Pro by Google
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
});

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runGenerateTitle = async (req: any) => {
  let response;
  const { messages } = req.body;
  const conversationToSummarize = await messages
    .slice(1)
    .map((m: any) => m.message)
    .join("\n");
  console.log(conversationToSummarize);
  const conversationPrompt = `Describe the following conversation snippet in 3 words or less.
       >>>
       Hello
     ${conversationToSummarize}
       >>>
       `;
  /* Disabling Generate title using Open AI to save more on cost*/
  //      response = await chat.call([
  //   new HumanChatMessage(conversationPrompt),
  // ]);

  /* Generate title using Gemini Pro to save on cost via Langchain*/
  response = await model.invoke([["human", conversationPrompt]]);
  const finalResponse = response.content;

  return finalResponse;
};

export default router;
