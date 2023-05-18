import cheerio from "cheerio";
import fetch from "node-fetch";
import { Document } from "langchain/document";

export const createCheerioWebBaseLoader = (url) => {
  return {
    async load() {
      // Fetch the HTML content from the URL
      const response = await fetch(url);
      const html = await response.text();

      // Load the HTML content into Cheerio
      const $ = cheerio.load(html);

      // Extract the data you need from the HTML using Cheerio
      // For example, let's extract all the text inside paragraph tags
      const paragraphs = [];
      $("p").each((index, element) => {
        paragraphs.push($(element).text());
      });

      const metadata = {
        source: "haha ",
      };
      // Create da document for each paragraph
      const documents = paragraphs.map((text) => {
        // if (index === 2) {
        //   console.log("text value:", text);
        //   console.log(typeof text);
        // }
        // if (text === undefined) console.log("text is undefined");
        const cleanedContent = text.replace(/\s+/g, " ").trim();

        return new Document({
          pageContent: cleanedContent,
          metadata,
        });
      });
      console.log(documents);
      return documents;
    },
  };
};
