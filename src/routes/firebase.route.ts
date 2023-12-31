import express from "express";
import { adminDb } from "../firebaseAdmin.js";
import admin from "firebase-admin";

const router = express.Router();

router.route("/").get(async (req, res) => {
  const { userID } = req.query;

  try {
    const conversationRef = adminDb.collection("conversations");
    // const querySnapshot = await usersRef.where("googleId", "==", googleId).get();

    const snapshot = await conversationRef
      .where("userID", "==", userID)
      .orderBy("dateLastUpdated", "desc")
      .limit(20)
      .get();
    const conversations = [];

    snapshot.forEach((doc) => {
      const conversation = doc.data();
      conversation.id = doc.id;

      // Convert the "dateCreated" field from Firestore Timestamp to Javascript date
      conversation.dateCreated = conversation.dateCreated
        .toDate()
        .toLocaleString();
      conversation.dateLastUpdated = conversation.dateLastUpdated
        .toDate()
        .toLocaleString();
      conversations.push(conversation);
    });

    res.status(200).send(conversations);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  // if (!doc.exists) {
  //   console.log("No such document!");
  //   return res.sendStatus(400);
  // }
});

router.route("/add").post(async (req, res) => {
  interface Conversation {
    id: string;
    title: string;
    dateCreated: string;
    dateLastUpdated: string;
    selectedAI: string;
    userID: string;
    messages: Object;
  }

  const convoInput: Conversation = req.body.data;
  console.log(convoInput);
  const conversation = {
    ...convoInput,
    dateCreated: new Date(convoInput.dateCreated), // Convert dateCreated to Firestore Time stamp
    dateLastUpdated: new Date(convoInput.dateLastUpdated), // Convert dateLastUpdated to Firestore Time stamp
  };

  try {
    const convoRef = adminDb.collection("conversations").doc(convoInput.id);
    const doc = await convoRef.set(conversation);

    console.log("Document written");
    res.status(200).send("Document added Successfully!");
  } catch (error) {
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
  } catch (error) {
    console.error("Error updating document: ", error);
    res.status(500).send("Error updating document:");
  }
});
router.route("/delete").delete(async (req, res) => {});

export default router;
