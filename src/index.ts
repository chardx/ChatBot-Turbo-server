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

// app.use(
//   cookieSession({
//     name: "ChatBotTurboSession",
//     keys: process.env.COOKIE_SESSION_SECRET.split(","),
//     maxAge: 24 * 60 * 60 * 1000,
//     cookie: {
//       sameSite: "none",
//       domain: process.env.NODE_ENV === "production" ? "onrender.com" : "",
//       httpOnly: false,
//     },
//   })
// );

app.set("trust proxy", 1);
app.use(
  session({
    secret: "ChaD Software Development",
    resave: false,
    saveUninitialized: false,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  })
);

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

//console.log() values of "req.session" and "req.user" so we can see what is happening during Google Authentication
// let count = 1;
// const showlogs = (req, res, next) => {
//   console.log("\n==============================");
//   console.log(`------------>  ${count++}`);

//   console.log(`\n req.session.passport -------> `);
//   console.log(req.session.passport);

//   console.log(`\n req.user -------> `);
//   console.log(req.user);

//   console.log("\n Session and Cookie");
//   console.log(`req.session.id -------> ${req.session.id}`);
//   console.log(`req.session.cookie -------> `);
//   console.log(req.session.cookie);

//   console.log("===========================================\n");

//   next();
// };

// app.use(showlogs);

//Google Auth
app.use("/auth", authenticationRoutes);
// app.use(
//   "/auth",
//   passport.initialize(),
//   passport.session(),
//   authenticationRoutes
// );
app.get("/", async (req, res) => {
  res.write("<h1>Hello World!</h1>");
  res.write("Wait I am thinking!\n");
  const result = await runScript();
  res.write("Good company name would be :" + result);
  res.send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
