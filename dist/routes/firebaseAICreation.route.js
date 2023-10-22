import express from "express";
import { adminDb } from "../firebaseAdmin.js";
import admin from "firebase-admin";
const router = express.Router();
router.route("/").get(async (req, res) => {
    try {
        const aiListRef = adminDb.collection("ai");
        // const querySnapshot = await usersRef.where("googleId", "==", googleId).get();
        const listOfAllAi = [];
        const snapshot = await aiListRef.orderBy("id", "asc").get();
        snapshot.forEach((doc) => {
            const ai = doc.data();
            const aiSort = {
                id: ai.id,
                aiName: ai.aiName,
                content: ai.content,
                description: ai.description,
                voice: ai.voice,
                voice11labs: ai.voice11labs,
                picture: ai.picture,
                dateCreated: ai.dateCreated,
                dateLastUpdated: ai.dateLastUpdated,
            };
            listOfAllAi.push(aiSort);
        });
        console.log("Firebase AI Creation routes called!");
        res.status(200).send(listOfAllAi);
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
    console.log(convoInput);
    const conversation = {
        ...convoInput,
        dateCreated: new Date(convoInput.dateCreated),
        dateLastUpdated: new Date(convoInput.dateLastUpdated), // Convert dateLastUpdated to Firestore Time stamp
    };
    try {
        const convoRef = adminDb.collection("ai").doc();
        await convoRef.set(conversation);
        console.log("Document written");
        res.status(200).send("Document added Successfully!");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error saving the conversation");
    }
});
router.route("/update/:id").patch(async (req, res) => {
    try {
        const conversationID = req.params.id;
        const { filteredMessages } = req.body;
        const updateRef = adminDb.collection("conversations").doc(conversationID);
        //Separate userMessage and gptMessage in 2 objects
        const userMessage = filteredMessages[0];
        const gptMessage = filteredMessages[1];
        //Use arrayUnion to add the 2 objects to save on Firebase write cost
        await updateRef.update({
            messages: admin.firestore.FieldValue.arrayUnion(userMessage, gptMessage),
            dateLastUpdated: new Date(),
        });
        console.log("Document updated successfully");
        res.status(200).send("Document updated successfully");
    }
    catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send("Error updating document:");
    }
});
router.route("/delete").delete(async (req, res) => { });
export default router;
//# sourceMappingURL=firebaseAICreation.route.js.map