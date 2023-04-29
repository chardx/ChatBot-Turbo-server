import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

//Alternative to using the serviceAccountKey.json file
//solution found here:
//https://dev.to/vvo/how-to-add-firebase-service-account-json-files-to-vercel-ph5

// import serviceAccount from "./serviceAccountKey.json";
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const adminDb = admin.firestore();

export { adminDb };
