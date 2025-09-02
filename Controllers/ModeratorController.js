// ModeratorController.js
const User = require("../models/User");
const Task = require("../models/Task");

// Review a task
exports.reviewTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task reviewed", task });
  } catch (error) {
    res.status(500).json({ message: "Error reviewing task", error: error.message });
  }
};

// Approve a task
exports.approveTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task approved", task });
  } catch (error) {
    res.status(500).json({ message: "Error approving task", error: error.message });
  }
};

// Reject a task
exports.rejectTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task rejected", task });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting task", error: error.message });
  }
};
//view Reports
exports.viewReports = async (req, res) => {
  try {
    // your logic here
    res.json({ message: "Reports retrieved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View all users
exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};