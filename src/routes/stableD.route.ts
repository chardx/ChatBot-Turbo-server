import express from "express";

const router = express.Router();

const API_URL =
  "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

router.route("/").post(async (req, res) => {
  const { prompt: input } = req.body;
  try {
    const results = await runProcessImage(req, input);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runProcessImage = async (req: any, input: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      },
      body: JSON.stringify(input),
    });
    // const blob = await response.blob();
    // console.log(blob);
    // console.log("Hey I was executed");
    // console.log(URL.createObjectURL(blob));
    // return `${URL.createObjectURL(blob)}`;

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.log("error was called!");
    console.log(error);
  }
};
export default router;
