// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc    Authenticate user and return JWT
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username?.toLowerCase().trim() });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new staff user
// @route   POST /api/auth/register
// @access  Protected — admin, manager
export const createUser = async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password: hashed,
      fullName,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all active waiters
// @route   GET /api/auth/waiters
// @access  Protected
export const getWaiters = async (req, res) => {
  try {
    const waiters = await User.find({ role: "waiter", isActive: true })
      .select("fullName")
      .sort({ fullName: 1 });

    res.json(waiters.map((w) => ({ id: w._id, fullName: w.fullName })));
  } catch (error) {
    console.error("Failed to fetch waiters:", error.message);
    res.status(500).json({ message: "Failed to fetch waiters" });
  }
};
