import express from "express";
const router = express.Router();
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

router.route("/").post(async (req, res) => {
  try {
    const results = await askPinecone(req);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const askPinecone = async (req) => {
  const { question, namespace } = req.body;
  // console.log(`Querying question to Pinecone index: ${question}`);
  const apiKey = process.env.PINECONE_API_KEY;
  const environment = process.env.PINECONE_ENVIRONMENT;
  const indexName = process.env.PINECONE_INDEX;

  if (!apiKey || !environment) {
    console.warn(
      "Warning: API key, environment, or Pinecone index name not found in process environment variables or function parameters. Please ensure to input your Pinecone API key, environment, and index name in the .env file or function parameters for this function to work."
    );
    return;
  }

  const client = new PineconeClient();
  await client.init({
    apiKey,
    environment,
  });

  const index = client.Index(indexName);
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  let queryResponse = await index.query({
    queryRequest: {
      namespace: namespace || null,
      topK: 3,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    },
  });

  let response = {};

  if (queryResponse.matches.length) {
    const topResultsString = queryResponse.matches
      .map((match: any, index) => `${index + 1}. ${match.metadata.txtPath}`)
      .join(", ");

    response = `indexName: ${indexName}, question: ${question}, namespace: ${namespace}, answer: Query '${question}' to index '${indexName}' in namespace '${namespace}' yielded the following top results: ${topResultsString}`;
  } else {
    response = `indexName: ${indexName}, question: ${question}, namespace: ${namespace}, answer: There were no matches found for the question: ${question} in the Pinecone index: ${indexName}`;
  }
  return response;
};

export default router;
