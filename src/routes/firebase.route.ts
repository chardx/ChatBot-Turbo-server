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
  interface Conversation {
    message: string;
    sender: string;
    sentTime: string;
    isImage?: boolean;
    imageUrl?: string;
  }

  const convoInput: Conversation = req.body;

  try {
    const convoRef = adminDb
      .collection("conversations")
      .doc("7snqBsVwYqlcTyYNbaJe");
    const doc = await convoRef.set(convoInput);

    console.log("Document written");
    res.status(200).send("Document added Successfully!");
  } catch (error) {
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
  } catch (error) {
    console.error("Error updating document: ", error);
    res.status(500).send("Error updating document:");
  }
});
router.route("/delete").delete(async (req, res) => {});

export default router;
