import express from "express";
import * as dotenv from "dotenv";
import passport from "passport";
import { truncateSync } from "fs";

dotenv.config();
const router = express.Router();

// router.use(express.urlencoded({ extended: true }));

router.route("/").get(async (req, res) => {
  res.write("<h1>Authentication Routes</h1>");
  res.write(`<p>${process.env.CLIENT_URL}</p>`);
  res.send();
});

const isLoggedIn = (req, res, next) => {
  console.log(req.logout);
  console.log(req.session);
  console.log("I got called");
  console.log(req.cookies);
  console.log("Req.sessionID");
  console.log(req.sessionID);
  console.log("Req.user");
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    res.status(401).json({
      error: true,
      message: "Not yet Authenticated",
    });
  }
};

router.route("/login/success").post(function (req: any, res) {
  if (req.user) {
    console.log("Login Success");
    console.log(req.user);
    res.status(200).json({
      error: false,
      message: "Successfully Loged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

// router.route("/google/callback").get(function (req, res, next) {
//   passport.authenticate("google", function (err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.redirect(process.env.CLIENT_URL);
//     }

//     // Call req.login() inside the authentication callback
//     req.login(user, function (err) {
//       if (err) {
//         return next(err);
//       }
//       return res.redirect(process.env.CLIENT_URL);
//     });
//   })(req, res, next);
// });

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
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
