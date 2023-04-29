import express from "express";
import { adminDb } from "../firebaseAdmin.js";
const router = express.Router();
router.route("/").get(async (req, res) => {
    res.write("<h1>Welcome to Firebase Routes<h1>");
    res.send();
});
router.route("/add").get(async (req, res) => {
    const convoRef = adminDb
        .collection("conversations")
        .doc("x8USB8hRqWGWbEBVUk85");
    const doc = await convoRef.get();
    if (!doc.exists) {
        console.log("No such document!");
        return res.sendStatus(400);
    }
    console.log("Document data:", doc.data());
    res.status(200).send(doc.data());
});
router.route("/add").post(async (req, res) => {
    console.log("hi");
    console.log(JSON.stringify(req.body));
    const convoInput = req.body;
    try {
        const convoRef = adminDb.collection("conversations");
        const doc = await convoRef.add(convoInput);
        res.status(200).send(doc);
    }
    catch (error) {
        console.log(error);
    }
});
export default router;
//# sourceMappingURL=firebase.route.js.map