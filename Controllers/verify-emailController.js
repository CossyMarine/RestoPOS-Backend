import User from "../models/User.js";
import crypto from "crypto";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // decode JWT token to get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    // mark as verified
    user.isVerified = true;

    // generate unique ID (example: MC + 6 random alphanumeric characters)
    const randomId = "MC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    user.uniqueId = randomId;

    await user.save();

    res.status(200).json({ message: "Email verified!", uniqueId: randomId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};