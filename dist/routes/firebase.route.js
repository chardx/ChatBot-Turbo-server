import express from "express";
import { adminDb } from "../firebaseAdmin.js";
const router = express.Router();
router.route("/").get(async (req, res) => {
    try {
        const conversationRef = adminDb.collection("conversations");
        const snapshot = await conversationRef.orderBy("dateLastUpdated", "desc").get();
        const conversations = [];
        snapshot.forEach((doc) => {
            const conversation = doc.data();
            conversation.id = doc.id;
            conversations.push(conversation);
        });
        console.log("Document data:", conversations);
        res.status(200).send(conversations);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
    // if (!doc.exists) {
    //   console.log("No such document!");
    //   return res.sendStatus(400);
    // }
});
router.route("/add").post(async (req, res) => {
    const convoInput = req.body.data;
    try {
        const convoRef = adminDb.collection("conversations").doc(convoInput.id);
        const doc = await convoRef.set(convoInput);
        console.log("Document written");
        res.status(200).send("Document added Successfully!");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error saving the conversation");
    }
});
router.route("/update").patch(async (req, res) => {
    try {
        const messageRef = req.body;
        const updateRef = adminDb
            .collection("conversations")
            .doc("wlYuNIqL0kXHNkMIiXRp");
        updateRef.update(messageRef);
        res.status(200).send("Document updated successfully");
    }
    catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send("Error updating document:");
    }
});
router.route("/delete").delete(async (req, res) => { });
export default router;
//# sourceMappingURL=firebase.route.js.map