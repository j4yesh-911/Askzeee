
import express from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";

const router = express.Router();

// Validate user ID
const getUserId = (req, res) => {
  const userId = req.query.userId || req.body.userId;

  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "User ID is required" });
    return null;
  }

  return userId;
};

// GET: Fetch user's chat history
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const chats = await Chat.find({ userId })
      .select("-messages")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to load conversations" });
  }
});

// POST: Create a new conversation
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const chat = await Chat.create({
      userId,
      title: req.body.title || "New Chat"
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET: Open a specific conversation
router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to open conversation" });
  }
});

// PATCH: Rename conversation
router.patch("/:id/rename", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to rename conversation" });
  }
});

// PATCH: Pin or unpin conversation
router.patch("/:id/pin", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.pinned = !chat.pinned;
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to update pin" });
  }
});

// DELETE: Delete conversation
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
