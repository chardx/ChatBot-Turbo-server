import { adminDb } from "../../firebaseAdmin.js";
import admin from "firebase-admin";

export const authenticateFirebaseUser = async ({ profile, googleId }) => {
  console.log("googleId", googleId);

  const foundUser = await findUserByGoogleId(googleId);
  if (foundUser) {
    //If User found, return the user
    console.log("User found:", foundUser);
    console.log("foundUser");
    console.log(foundUser.googleId);
    return {
      id: foundUser.googleId,
      user: foundUser.displayName,
      picture: foundUser.profilePicture,
    };
  } else {
    //If User not found, Register the user in Firestore
    console.log("User not found.");
    try {
      const userRef = await adminDb.collection("users").add({
        googleId,
        displayName: profile.displayName,
        profilePicture: profile.photos[0].value,
        email: profile.emails[0].value,
      });

      return {
        id: googleId,
        user: profile.displayName,
        picture: profile.photos[0].value,
      };
    } catch (error) {
      console.log(error);
    }
  }
};

const findUserByGoogleId = async (googleId) => {
  const usersRef = adminDb.collection("users");
  const querySnapshot = await usersRef.where("googleId", "==", googleId).get();

  if (querySnapshot.empty) {
    // User not found
    return null;
  } else {
    // User found, return the first matching document
    const userDoc = querySnapshot.docs[0];
    return userDoc.data();
  }
};
