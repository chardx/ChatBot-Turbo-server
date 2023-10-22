import express from "express";
const router = express.Router();
import { PineconeClient } from "@pinecone-database/pinecone";
router.route("/").post(async (req, res) => {
    const { options } = req.body;
    try {
        const results = await createPinecone(req);
        res.status(200).json({ results });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
const createPinecone = async (req) => {
    const indexName = process.env.PINECONE_INDEX;
    if (!indexName) {
        console.warn("No indexName provided and no 'PINECONE_INDEX' environment variable found. Please specify an index name.");
        return;
    }
    // console.log(`Checking if ${indexName} index exists in Pinecone...`);
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const vectorDimension = 1536; // Vector dimension is set to a constant value
    if (!apiKey || !environment) {
        return "API key or environment not found in process environment variables. Please ensure to input your Pinecone API key and environment in the .env file for this function to work.";
    }
    const client = new PineconeClient();
    await client.init({
        apiKey,
        environment,
    });
    const existingIndexes = await client.listIndexes();
    try {
        if (!existingIndexes.includes(indexName)) {
            console.log(`Creating index "${indexName}" this can take a couple minutes to initalize the index if creating for the first time`);
            await client.createIndex({
                createRequest: {
                    name: indexName,
                    dimension: vectorDimension,
                    metric: "cosine",
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 60000)); // Pause for 30 seconds while initalizing the firs time
            return `Created client with index "${indexName}"`;
        }
        else {
            return `"${indexName}" already exists.`;
        }
    }
    catch (error) {
        console.log(error);
        return `Index name ${indexName} cannot be created. Reached maximum index!`;
    }
};
export default router;
//# sourceMappingURL=createPinecone.route.js.map