// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes (AUTH ONLY — no side effects)
export const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ No token
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // 4️⃣ Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    // 5️⃣ Active check
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated. Contact your admin." });
    }

    // 6️⃣ Attach user
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res
      .status(401)
      .json({ message: "Not authorized, token failed" });
  }
};

// Restrict a route to specific roles — usage: authorize("admin", "manager")
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
