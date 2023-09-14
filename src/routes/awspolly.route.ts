import express from "express";
import * as dotenv from "dotenv";
import { Readable } from "stream";
import fs from "fs";

import { SynthesizeSpeechCommand, PollyClient } from "@aws-sdk/client-polly";
import { Polly, DescribeVoicesCommand } from "@aws-sdk/client-polly";

dotenv.config();
const router = express.Router();

const creds = {
  accessKeyId: process.env.AWS_POLLY_ACCESS_KEY,
  secretAccessKey: process.env.AWS_POLLY_SECRET_ACCESS_KEY,
};

const client = new PollyClient({
  region: "us-west-2",
  credentials: creds,
});

router.route("/").get(async (req, res) => {
  res.write("<h1>TTS Amazon Polly/h1>");

  res.send();
});

router.route("/").post(async (req, res) => {
  try {
    await processTextToSpeech(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.route("/getVoices").get(async (req, res) => {
  try {
    const awsAllVoices = await getAllVoices();
    console.log(awsAllVoices);
    res.status(200).send(awsAllVoices);
  } catch (error) {}
});

export const processTextToSpeech = async (req, res) => {
  const { message: textStream, activeVoice } = req.body;

  // Create the parameters
  var command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: textStream,
    TextType: "text",
    VoiceId: activeVoice,
    Engine: "neural",
    SampleRate: "22050",
  });

  try {
    const data = await client.send(command);
    if (data.AudioStream instanceof Readable) {
      console.log("Readable");
      data.AudioStream.pipe(fs.createWriteStream("fileName.mp3"));
      // Pass the audio stream as the response
      res.set("Content-Type", "audio/mpeg");
      data.AudioStream.pipe(res);
    } else {
      console.log("no Readable");
      res.status(500).json({ error: "Audio stream not available." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllVoices = async () => {
  const client = new Polly({ region: "us-west-2", credentials: creds });
  try {
    const data = await client.send(new DescribeVoicesCommand({}));
    const voices = data.Voices.filter(
      (voice) =>
        voice.SupportedEngines[0] === "neural" &&
        voice.LanguageCode.slice(0, 2) === "en"
    );
    return voices;
  } catch (error) {
    console.error("Error getting voices:", error);
    throw error;
  }
};
export default router;
