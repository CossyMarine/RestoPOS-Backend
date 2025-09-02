const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const AuthRoutes = require("./routes/AuthRoutes");
app.use("/api/auth", AuthRoutes);
const TaskRoutes = require("./routes/TaskRoutes");
app.use("/api/tasks", TaskRoutes);
const TaskSubmissionRoutes = require("./routes/TaskSubmissionRoutes");
app.use("/api/task-submissions", TaskSubmissionRoutes);
const CampaignRoutes = require("./routes/CampaignRoutes");
app.use("/api/campaign", CampaignRoutes);
const UserRoutes = require("./routes/UserRoutes");
app.use("/api/user", UserRoutes);
const WalletRoutes = require("./routes/WalletRoutes");
app.use("/api/wallet", WalletRoutes);
const ModeratorRoutes = require("./routes/ModeratorRoutes");
app.use("/api/moderator", ModeratorRoutes);
const RewardCodeRoutes = require("./routes/RewardCodeRoutes");
app.use("/api/rewardcode", RewardCodeRoutes);
const ReferralRoutes = require("./routes/ReferralRoutes");
app.use("/api/referral", ReferralRoutes);

const ChatRoutes = require("./routes/ChatRoutes");
app.use("/api/chat", ChatRoutes);

// Export the app last
module.exports = app;
