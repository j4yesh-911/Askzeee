
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import connectDB from "./config/db.js";
import conversationRoutes from "./routes/conversations.js";
dotenv.config();

const app = express();

app.use(cors({
  origins:[ "http://localhost:5173",   "http://10.159.142.122:5173"]
  
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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Askzeee server running on port ${PORT}`);
  });
};

startServer();
