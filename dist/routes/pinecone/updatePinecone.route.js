import express from "express";
const router = express.Router();
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
router.route("/").post(async (req, res) => {
    try {
        const results = await updatePinecone(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const updatePinecone = async (req) => {
    const { text, source, namespace } = req.body;
    console.log("Request body value");
    console.log(`${text} , ${source}, ${namespace}`);
    console.log(`Updating Pinecone index with: ${text}..`);
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const indexName = process.env.PINECONE_INDEX;
    console.log("Index Name:");
    console.log(indexName);
    if (!apiKey || !environment || !indexName) {
        throw new Error("API key, environment, or Pinecone index name not found in process environment variables or function parameters. Please ensure to input your Pinecone API key, environment, and index name in the .env file or function parameters for this function to work.");
    }
    const client = new PineconeClient();
    await client.init({
        apiKey,
        environment,
    });
    const index = client.Index(indexName);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
    });
    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Chunks ${chunks}`);
    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " ")));
    const batchSize = 100;
    let batch = [];
    for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const vector = {
            id: `${text}_${idx}`,
            values: embeddingsArrays[idx],
            metadata: {
                ...chunk.metadata,
                source,
                loc: JSON.stringify(chunk.metadata.loc),
                txtPath: text,
            },
        };
        batch.push(vector);
        if (batch.length === batchSize || idx === chunks.length - 1) {
            await index.upsert({
                upsertRequest: {
                    vectors: batch,
                    namespace: namespace, // Use the namespace parameter here
                },
            });
            batch = [];
        }
    }
    return `The Pinecone index "${indexName}" was updated with text: "${text}" in the namespace "${namespace}"`;
};
export default router;
//# sourceMappingURL=updatePinecone.route.js.map