
import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { chatId, message, userId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "User ID is required"
      });
    }

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        userId
      });

      if (!chat) {
        return res.status(404).json({
          error: "Chat not found"
        });
      }
    } else {
      chat = new Chat({
        userId,
        title: message.trim().slice(0, 35)
      });
    }

    const conversationMessages = [
      ...chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user",
        content: message.trim()
      }
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "Askzeee"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL,
          messages: [
            {
              role: "system",
              content: "You are Askzeee, a helpful and friendly AI assistant."
            },
            ...conversationMessages
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "AI returned an empty response"
      });
    }

    chat.messages.push({
      role: "user",
      content: message.trim()
    });

    chat.messages.push({
      role: "assistant",
      content: reply
    });

    await chat.save();

    res.json({
      chatId: chat._id,
      title: chat.title,
      reply,
      pinned: chat.pinned
    });

  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

export default router;
