import fs from "fs";

import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { directoryLoader } from "./directoryLoader.js";

import { VECTOR_STORE_PATH } from "./index.js";
//function to normalize the content of the documents
export const normalizeDocuments = (docs) => {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
};

export const updateVectorStore = async (docs, vectorStore) => {
  docs = await directoryLoader();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const normalizedDocs = normalizeDocuments(docs);
  const splitDocs = await textSplitter.createDocuments(normalizedDocs);

  console.log("Updating documents...");

  // Check if an existing vector store is available
  console.log("Checking for existing vector store...");

  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // Load the existing vector store
    console.log("Loading existing vector store...");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
    console.log("Vector store loaded.");

    console.log("Updating vector store with new documents...");
    await vectorStore.addDocuments(splitDocs);
    console.log("Vector store updated.");
  } else {
    //  Create a new vector store if one does not exist
    try {
      console.log("Creating new vector store...");

      // Generate the vector store from the documents
      vectorStore = await HNSWLib.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings()
      );
      // Save the vector store to the specified path
      await vectorStore.save(VECTOR_STORE_PATH);
      console.log("Vector store created.");
    } catch (error) {
      console.log(error);
    }
  }

  return [docs, vectorStore];
};
