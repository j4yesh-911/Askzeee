
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversations.js";

dotenv.config();

const app = express();

// Allow frontend requests
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));

app.use(express.json());

// Connect to MongoDB before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      error: "Database connection failed"
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Askzeee API!",
    status: "Server running"
  });
});

// API routes
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);

// Export app for Vercel
export default app;

// Run locally only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Askzeee server running on port ${PORT}`);
  });
}
