import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { authenticateFirebaseUser } from "./routes/auth/firebaseUser.js";
import jwt from "jsonwebtoken";

const authUser = async (req, accessToken, refreshToken, profile, done) => {
  const userProfile = await authenticateFirebaseUser({
    profile,
    googleId: profile.id,
  });
  console.log("User Profile:");
  // console.log(userProfile);

  //JWT implementation
  const jwtPayload = {
    userID: userProfile.userID,
    googleId: userProfile.googleId,
    user: userProfile.user,
    picture: userProfile.picture,
    email: userProfile.email,
  };

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  console.log("User Profile and token");
  console.log(userProfile);
  console.log(token);
  // Set the token as an HTTP-only cookie

  return done(null, { userProfile, token });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    authUser
  )
);

passport.serializeUser((user, done) => {
  console.log(`${new Date()}\n--------> Serializing User`);
  console.log(user);
  done(null, user);
});

// passport.serializeUser((user, done) => {
//   console.log(`\n--------> Serialize User:`);
//   process.nextTick(function () {
//     return done(null, {
//       id: user.id,
//       username: user.username,
//       picture: user.picture,
//     });
//   });
// });

// passport.serializeUser((user, done) => {
//   console.log(`\n--------> Serialize User:`);
//   // console.log(user);

//   // The USER object is the "authenticated user" from the done() in authUser function.
//   // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.

//   done(null, user);
// });

passport.deserializeUser((user, done) => {
  console.log("\n--------- Deserialized User:");
  console.log(user);
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

  done(null, user);
});
