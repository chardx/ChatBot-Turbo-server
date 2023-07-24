import express from "express";
import { runScript } from "./app.js";
import googleRoutes from "./routes/google.route.js";
import stableDRoutes from "./routes/stablediffusion.route.js";
import stableDummy from "./routes/stableD.route.js";
import generateTitle from "./routes/chatTitle.route.js";
import firebaseRoutes from "./routes/firebase.route.js";
import documentLoaderRoutes from "./routes/document-loader/index.js";
import huggingFaceRoutes from "./routes/huggingface.route.js";
import describeImageRoutes from "./routes/describeimage.route.js";
import fileUploaderRoutes from "./routes/file-uploader/index.js";
import ttsPollyRoutes from "./routes/awspolly.route.js";
import getCurrentWeatherRoutes from "./routes/getCurrentWeather.route.js";
import uploadImageRoutes from "./routes/uploadImage.route.js";
import authenticationRoutes from "./routes/auth/index.js";

//Google Auth
import passport from "passport";
import cookieSession from "cookie-session";
import session from "express-session";
import "./passport.js";

import cors from "cors";
const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: "GET,POST,PATCH,PUT,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
    "Set-Cookie",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     process.env.CLIENT_URL || "http://localhost:5173"
//   );
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
// app.set("trust proxy", 1); // trust first proxy

app.use(
  cookieSession({
    name: "ChatBotTurboSession",
    keys: process.env.COOKIE_SESSION_SECRET.split(","),
    maxAge: 24 * 60 * 60 * 1000,
    cookie: {
      domain: "chadxgpt.online",
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      httpOnly: true,
    },
  })
);

// app.set("trust proxy", 1);
// app.use(
//   session({
//     secret: "ChaD Software Development",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       domain: process.env.NODE_ENV === "production" ? "onrender.com" : "",
//     },
//   })
// );

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: "50mb" }));
app.use("/api/google", googleRoutes);
app.use("/api/stableD", stableDRoutes);
app.use("/api/stableDummy", stableDummy);
app.use("/api/generateTitle", generateTitle);
app.use("/api/firebase", firebaseRoutes);
app.use("/api/documentLoader", documentLoaderRoutes);
app.use("/api/fileuploader", fileUploaderRoutes);
app.use("/api/huggingface", huggingFaceRoutes);
app.use("/api/describeImage", describeImageRoutes);
app.use("/api/awspolly", ttsPollyRoutes);
app.use("/api/getCurrentWeather", getCurrentWeatherRoutes);
app.use("/api/uploadImage", uploadImageRoutes);


//Google Auth
app.use("/auth", authenticationRoutes);

app.get("/", async (req, res) => {
  res.write("<h1>Welcome to Chad GPT backend</h1>");

  res.write("Server status is up and running!<br><br>");
  console.log("Server accessed last " + new Date());
  res.write("Date and Time update: " + new Date());
  res.send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
