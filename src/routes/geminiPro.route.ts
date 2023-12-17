import express from "express";

const router = express.Router();
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.route("/").post(async (req, res) => {
  const { chatMessages, activeAI } = req.body;
  try {
    const results = await runGeminiPro(req, chatMessages, activeAI);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runGeminiPro = async (req, chatMessages, activeAI) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const [systemMessage, history, userNewMessage] = getHistoryAndNewMessage(
    chatMessages,
    activeAI
  );
  console.log("Value of system message");
  console.log(systemMessage);

  console.log("Value of history");
  console.log(history);
  let modifiedHistory = [systemMessage, ...history];
  console.log("HIstory dummy");
  console.log(modifiedHistory);
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: "Hello!",
      },
      ...modifiedHistory,
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessage(userNewMessage);
  const { response } = result;
  const text = response.text();

  console.log(text);
  return text;
};

const getHistoryAndNewMessage = (chatMessages, activeAI) => {
  const systemMessage = { role: "model", parts: activeAI.content };
  const userNewMessage = chatMessages[chatMessages.length - 1].message;
  let history = chatMessages
    .filter((_, i) => i > 0 && i < chatMessages.length - 1)
    .map((chatMessage, i) => {
      let role = chatMessage.sender === "ChatGPT" ? "model" : "user";
      return { role, parts: chatMessage.message };
    });

  return [systemMessage, history, userNewMessage];
};

export default router;
