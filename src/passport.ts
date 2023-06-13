import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { authenticateFirebaseUser } from "./routes/auth/firebaseUser.js";

const authUser = async (req, accessToken, refreshToken, profile, done) => {
  const userProfile = await authenticateFirebaseUser({
    profile,
    googleId: profile.id,
  });
  console.log("User Profile:");
  // console.log(userProfile);
  return done(null, userProfile);
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
    // function (req, accessToken, refreshToken, profile, done) {
    //   console.log(profile)
    //   done(null, profile);
    // }
  )
);

passport.serializeUser((user, done) => {
  console.log("\n--------> Serializing User");
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
