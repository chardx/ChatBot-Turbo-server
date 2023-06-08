//1 Import document loaders for different file formats
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

//Cheerio to WebScrape
import { createCheerioWebBaseLoader } from "./cheerio-webbase-loader/cherrioWebBaseLoader.js";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

import { directoryPath } from "./index.js";
export const directoryLoader = async () => {
  //5 Initialize the document loader with supported file formats
  const loader = new DirectoryLoader(directoryPath, {
    ".json": (path) => new JSONLoader(path),
    ".txt": (path) => {
      // console.log(`Loading TXT File ${path}`);
      return new TextLoader(path);
    },
    ".csv": (path) => new CSVLoader(path),
    ".pdf": (path) => new PDFLoader(path),
  });

  //6 Load documents from the specified directory
  console.log("Loading docs...");
  const docs = await loader.load();
  console.log("Docs loaded.");
  return docs;

  //   docs.forEach((doc, index) => {
  //     console.log(`Document ${index + 1}:`);
  //     console.log("Metadata:", doc.metadata);
  //     console.log("Content:", doc.pageContent);
  //   });
  // console.log(directoryDocs);
  // Execute the createCheerioWebBaseLoader
  // const cheerioLoader = createCheerioWebBaseLoader(
  //   "https://www.virginplus.ca/en/support/faq.html"
  // );

  // const cheerioLoader = new CheerioWebBaseLoader(
  //   "https://www.bell.ca/Mobility/Roam-Better-FAQ",
  //   {
  //     selector: "p",
  //   }
  // );

  // const cheerioDocs = await cheerioLoader.load();
  // console.log("Cheerio docs loaded.");
  // console.log(cheerioDocs);

  // Combine the results from both loaders
  // const allDocs = [...directoryDocs];

  // console.log(allDocs);
};
