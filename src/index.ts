import express from "express";
import { runScript } from "./app.js";
import googleRoutes from "./routes/google.route.js";
import stableDRoutes from "./routes/google.route.js";

import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/google", googleRoutes);
app.use("/api/stableD", stableDRoutes);

app.get("/", async (req, res) => {
  res.write("<h1>Hello World!</h1>");
  res.write("Wait I am thinking!\n");
  const result = await runScript();
  res.write("Good company name would be :" + result);
  res.send();
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
