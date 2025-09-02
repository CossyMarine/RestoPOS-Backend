require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./Config/connectDB");

const Message = require("./models/Message");

// Routes
const authRoutes = require("./routes/AuthRoutes");
const userRoutes = require("./routes/UserRoutes");
const walletRoutes = require("./routes/WalletRoutes");
const taskRoutes = require("./routes/TaskRoutes");
const referralRoutes = require("./routes/ReferralRoutes");
const chatRoutes = require("./routes/ChatRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // Listen for message
  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = new Message({
        sender: data.userId, // frontend must pass userId
        content: data.content,
        type: "text",
      });

      await newMessage.save();

      // Populate sender before sending back
      const populatedMsg = await newMessage.populate(
        "sender",
        "fullName badge referralLevel"
      );

      // Broadcast to ALL users
      io.emit("receiveMessage", populatedMsg);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ userName }) => {
    socket.broadcast.emit("typing", { userName });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Connect to MongoDB
connectDB().then(() => {
  console.log("✅ Database connected");
});

// Enable CORS + JSON
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/chat", chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));