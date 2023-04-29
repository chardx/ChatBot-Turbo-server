// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHgHY_1OcU3ziYZv4bG0cZw6c193GKlrs",
    authDomain: "chatbot-turbo.firebaseapp.com",
    projectId: "chatbot-turbo",
    storageBucket: "chatbot-turbo.appspot.com",
    messagingSenderId: "398625776830",
    appId: "1:398625776830:web:0673c4a23450218b7aaaef",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
//# sourceMappingURL=firebase.js.map