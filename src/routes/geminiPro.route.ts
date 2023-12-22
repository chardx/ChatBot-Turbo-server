import express from "express";

const router = express.Router();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import GeminiProcessingError from "../classes/geminiProcessingError.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
router.route("/").get(async (req, res) => {
  // Set headers to enable streaming and keep the connection alive
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const rawChatMessages: any = req.query.chatMessages;
  const rawActiveAI: any = req.query.activeAI;

  const chatMessages = JSON.parse(rawChatMessages);
  const activeAI = JSON.parse(rawActiveAI);
  console.log(chatMessages);
  console.log(activeAI);

  const result = await runGeminiPro(
    req,
    res,
    chatMessages,
    activeAI,
    (chunkText) => {
      console.log("Received chunk:", chunkText);
      res.write(chunkText);
    }
  );
  try {
    if (!result.success) {
      throw new GeminiProcessingError("Failed to generate AI response");
    } else {
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) {
      if (error instanceof SyntaxError) {
        console.log("Before response 1");

        res.status(400).json({ error: "Invalid JSON in request." });
        console.log("After response 1");
      } else if (error instanceof GeminiProcessingError) {
        console.log("Before response 2");

        // console.log(res);

        res
          .status(403)
          .send({ error: "Something went wrong with the Generative AI." });
        console.log("After response 2");
      } else {
        console.log("Before response 3");

        console.log(error);
        res.status(500).json({ error: "Internal server error." });
        console.log("After response 3");
      }
    }
  } finally {
    if (!res.headersSent) {
      res.end(); // Ensure the response is ended after sending an error response
    }
  }

  // res.on("close", () => {
  //   console.log("Client closed connection");
  //   res.end();
  // });

  // res.on("error", (error) => {
  //   console.error("Error in SSE stream:", error);
  // });
});

const runGeminiPro = async (
  req,
  res,
  chatMessages,
  activeAI,
  chunkCallback
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings,
  });

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

  //   const result = await chat.sendMessage(userNewMessage); Non Stream
  const result = await chat.sendMessageStream(userNewMessage);
  try {
    console.log("RESULT");
    console.log(result);
    console.log(result.stream);
    for await (const chunk of result.stream) {
      console.log("PROMPT FEEDBACK");

      console.log(chunk);
      if (
        chunk.promptFeedback &&
        chunk.promptFeedback.blockReason == "SAFETY"
      ) {
        console.log("Safety block Detected!");

        throw new GeminiProcessingError(
          `Safety Block Detected (non stream) ${chunk.promptFeedback.blockReason} = ${chunk.promptFeedback.safetyRatings}`
        );
      }

      if (chunk.candidates && chunk.candidates[0].finishReason !== "STOP") {
        console.log("Google block Detected!");
        chunkCallback("event: close\ndata: \n\n");
        // res.write("event: close\ndata: \n\n");
        const chunkText = chunk.text();
        console.log(chunkText);
        console.log(chunk.promptFeedback.safetyRatings);

        throw new GeminiProcessingError(
          `Google Block Detected while Streaming="${chunk.candidates[0].finishReason}"`
        );
      }

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
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
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
