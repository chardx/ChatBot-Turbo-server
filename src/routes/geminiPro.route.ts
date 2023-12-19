import express from "express";

const router = express.Router();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.route("/").get(async (req, res) => {
  const rawChatMessages: any = req.query.chatMessages;
  const rawActiveAI: any = req.query.activeAI;

  const chatMessages = JSON.parse(rawChatMessages);
  const activeAI = JSON.parse(rawActiveAI);
  console.log(chatMessages);
  console.log(activeAI);

  try {
    const chunks = await runGeminiPro(
      req,
      chatMessages,
      activeAI,
      (chunkText) => {
        console.log("Received chunk:", chunkText);
        res.write(chunkText);
      }
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }

  res.on("close", () => {
    console.log("Client closed connection");
    res.end();
  });
});

const runGeminiPro = async (req, chatMessages, activeAI, chunkCallback) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const [systemMessage, history, userNewMessage] = getHistoryAndNewMessage(
    chatMessages,
    activeAI
  );
  let modifiedHistory = [systemMessage, ...history];
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

  //   const result = await chat.sendMessage(userNewMessage);
  const result = await chat.sendMessageStream(userNewMessage);
  console.log("RESULT");
  console.log(result.stream);
  for await (const chunk of result.stream) {
    console.log(chunk);
    console.log("CHUNK.TEXT");
    console.log(chunk.text);
    const chunkText = chunk.text();
    if (!chunkText) {
      console.log("BLANK DETECTED!");
      console.log(chunk.candidates[0].finishReason);
      console.log(chunk.candidates[0].safetyRatings);
      return;
    }
    console.log(chunkText);

    chunkCallback(chunkText);
  }
};

const getHistoryAndNewMessage = (chatMessages, activeAI) => {
  console.log(activeAI);
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
