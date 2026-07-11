// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
  email: user.email || null,
  phone: user.phone || null,
});

// @desc    Authenticate any user (customer, waiter, kitchen, accountant, admin...)
//          by username, email, or phone — one login page for everyone
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Enter your login and password" });
    }

    const value = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ username: value }, { email: value }, { phone: identifier.trim() }],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Check if a username or a contact (email/phone) is already taken —
//          used for live validation while the person is typing
// @route   GET /api/auth/check-availability?field=email&value=jane@mail.com
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { field, value } = req.query;

    if (!field || !value || !["username", "email", "phone"].includes(field)) {
      return res.status(400).json({ message: "Invalid check request" });
    }

    const clean = field === "phone" ? value.trim() : value.toLowerCase().trim();
    const existing = await User.findOne({ [field]: clean }).select("_id");

    res.json({ available: !existing });
  } catch (error) {
    console.error("Check availability error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Self-registration for customers (phone OR email + username + password)
// @route   POST /api/auth/register-customer
// @access  Public
export const registerCustomer = async (req, res) => {
  try {
    const { method, contact, username, password } = req.body;

    if (!method || !contact || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["email", "phone"].includes(method)) {
      return res.status(400).json({ message: "Choose email or phone" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanContact = method === "email" ? contact.toLowerCase().trim() : contact.trim();

    // Check username and contact separately so the error is specific
    const usernameTaken = await User.findOne({ username: cleanUsername });
    if (usernameTaken) {
      return res.status(400).json({ message: "That username is already taken" });
    }

    const contactTaken = await User.findOne({ [method]: cleanContact });
    if (contactTaken) {
      return res.status(400).json({
        message: method === "email" ? "This email is already registered" : "This phone number is already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: cleanUsername,
      password: hashed,
      fullName: cleanUsername, // no separate full-name field collected at signup
      role: "customer",
      [method]: cleanContact,
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Register customer error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new staff user (admin/manager only)
// @route   POST /api/auth/register
// @access  Protected — admin, manager
export const createUser = async (req, res) => {
  try {
    const { username, password, fullName, role, email, phone } = req.body;

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
      email: email?.toLowerCase().trim() || undefined,
      phone: phone?.trim() || undefined,
    });

    res.status(201).json({
      message: "User created successfully",
      user: publicUser(user),
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
