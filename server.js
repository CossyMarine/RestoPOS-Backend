import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import Message from "./models/Message.js";
import ChatRoom from "./models/ChatRoom.js";
import { autoApproveOverdue } from "./Controllers/CampaignController.js";
import { getGlobalRoom } from "./Controllers/ChatController.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.includes("mainecash.vercel.app") || origin.includes("localhost"))
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ── URL regex (same as controller) ───────────────────────────────
const URL_REGEX = /(https?:\/\/|www\.)[^\s]+/i;

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // Client joins the main room with their userId + token info
  socket.on("join_room", ({ userId, role } = {}) => {
    socket.data.userId = userId;
    socket.data.role   = role;
    socket.join("main_room");
    console.log(`👤 ${userId} (${role}) joined main_room`);
  });

  // Typing indicator — broadcast to everyone else in room
  socket.on("typing", ({ userName }) => {
    if (userName) socket.to("main_room").emit("typing", { userName });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ── Auto-approve cron — runs every 6 hours ─────────────────────
setInterval(async () => {
  console.log("⏰ Running auto-approve check...");
  await autoApproveOverdue();
}, 6 * 60 * 60 * 1000);

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
