import express from "express";
import fs from "fs";
//4 Import dotenv for loading environment variables and fs for file system operations
import dotenv from "dotenv";
import { calculateCost } from "./calculateCost.js";
import { updateVectorStore } from "./updateVectorStore.js";
import { makeChain } from "./makeChain.js";
dotenv.config();
//GLobal Variables
export const VECTOR_STORE_PATH = "Documents.index";
export const directoryPath = "./src/routes/document-loader/documents";
let docs;
let vectorStore;
//  load documents from the specified directory. This function runs directoryLoader and updateVectorStore
[docs, vectorStore] = await updateVectorStore(docs, vectorStore);
const router = express.Router();
router.route("/").get(async (req, res) => {
    res.write("<h1>Document Loader Routes</h1>");
    res.send();
});
router.route("/").post(async (req, res) => {
    console.log("Document loader route called.");
    try {
        const results = await runDocumentLoader(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
// 9. Define the main function to run the entire process
const runDocumentLoader = async (req) => {
    const { messages } = req.body;
    const userMessage = messages.slice(-1)[0].message;
    const chat_history = messages.slice(0, -1).map((messageObject) => {
        let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
        return { role, content: messageObject.message };
    });
    // const chat_history = messages.reduce((acc, cur) => {
    //   let role = cur.sender === "ChatGPT" ? "assistant" : "user";
    //   return acc + `${role}: ${cur.message}`;
    // }, []);
    console.log(userMessage);
    console.log(chat_history);
    // Calculate the cost of tokenizing the documents
    console.log("Calculating cost...");
    const cost = await calculateCost(docs);
    console.log(`Cost calculated: $${cost.toFixed(2)} or ${(cost * 55).toFixed(2)} pesos`);
    // Check if the cost is within the acceptable limit
    if (cost <= 1) {
        // // Initialize the OpenAI language model
        const chain = makeChain(vectorStore);
        // Create a retrieval chain using the language model and vector store
        // console.log("Creating retrieval chain...");
        // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
        // Query the retrieval chain with the specified question
        console.log("Querying chain...");
        const res = await chain.call({
            question: userMessage,
            chat_history: chat_history,
        });
        console.log({ res });
        return res;
    }
    else {
        // If the cost exceeds the limit, skip the embedding process
        console.log("The cost of embedding exceeds $1. Skipping embeddings.");
    }
};
const watchDirectory = (directoryPath) => {
    fs.watch(directoryPath, async (eventType, filename) => {
        if (eventType === "rename" && filename) {
            console.log("A new file has been added to the directory");
            [docs, vectorStore] = await updateVectorStore(docs, vectorStore);
        }
    });
};
// Start watching the directory for file changes
watchDirectory(directoryPath);
export default router;
//# sourceMappingURL=index.js.map