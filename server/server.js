
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversations.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Askzeee API!",
    status: "Server running"
  });
});

app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);

// Connect to MongoDB once per server instance
let connectionPromise;

app.use(async (req, res, next) => {
  next();
});

// Initialize database connection
connectionPromise = connectDB();

export default app;

// Run locally, not on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  connectionPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`Askzeee server running on port ${PORT}`);
    });
  });
}
