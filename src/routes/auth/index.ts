import express from "express";
import * as dotenv from "dotenv";
import passport from "passport";
import { truncateSync } from "fs";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();

// router.use(express.urlencoded({ extended: true }));

router.route("/").get(async (req, res) => {
  res.write("<h1>Authentication Routes</h1>");
  res.write(`<p>${process.env.CLIENT_URL}</p>`);
  res.send();
});

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If the token is valid, the decoded object will contain the payload
    return decoded;
  } catch (err) {
    // If the token is invalid or has expired, an error will be thrown
    console.error("Invalid token:", err);
    return null;
  }
};

const isLoggedIn = (req, res, next) => {
  console.log("Checking if logged in...");

  console.log("bearer");
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    console.log("Failed authentication");
    res.status(401).json({
      error: true,
      message: "Failed Authentication",
    });
    return;
  }

  //Remove prefix Bearer before passing the token
  const authorizationHeader = req.headers.authorization;
  let token;
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    token = authorizationHeader.split(" ")[1]; // Extract token without "Bearer " prefix
  } else {
    // Handle the case when the token is directly provided without the "Bearer " prefix
    token = authorizationHeader;
  }

  const decodedToken: any = verifyToken(token);
  if (decodedToken) {
    // Token is valid, access the decoded payload
    req.decodedToken = decodedToken;
    console.log("User ID:", decodedToken.userID);
    console.log("Google ID:", decodedToken.googleId);
    console.log("User :", decodedToken.user);
    console.log("Email:", decodedToken.email);
    next();
  } else {
    // Token is invalid
    res.status(401).json({
      error: true,
      message: "Invalid Token",
    });
  }
};

router.route("/login/success").post(isLoggedIn, function (req: any, res) {
  console.log("Authorizing login...");
  console.log(req.decodedToken);
  console.log("Login Success");

  res.status(200).json({
    error: false,
    message: "Successfully Loged In",
    user: req.decodedToken,
  });
});

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  function (req: any, res) {
    console.log("Google Callback");
    console.log(req.user);
    res.cookie("jwtToken", req.user.token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.redirect(process.env.CLIENT_URL);
  }
);

router.route("/login/failed").get((req, res) => {
  res.status(401).json({
    error: true,
    message: "Login failure",
  });
});

router.route("/logout").get((req: any, res, next) => {
  console.log("Logout");
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

export default router;
