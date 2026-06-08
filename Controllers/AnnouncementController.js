import Announcement from "../models/Announcement.js";
import User from "../models/User.js";

// ── Public (users) ────────────────────────────────────────────────

export const getAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find({ isActive: true })
      .sort({ isPinned: -1, createdAt: -1 })
      .select("-readBy");
    res.json(items);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const markRead = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });
    if (!ann.readBy.includes(req.user._id)) {
      ann.readBy.push(req.user._id);
      await ann.save();
    }
    res.json({ message: "Marked as read" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const markAllRead = async (req, res) => {
  try {
    await Announcement.updateMany(
      { isActive: true, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: "All marked as read" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Announcement.countDocuments({
      isActive: true,
      readBy: { $ne: req.user._id },
    });
    res.json({ count });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── Admin ─────────────────────────────────────────────────────────

export const adminGetAll = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isVerified: true });
    const items = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 });
    const data = items.map(a => ({
      ...a.toObject(),
      readCount: a.readBy.length,
      totalUsers,
    }));
    res.json(data);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const adminCreate = async (req, res) => {
  try {
    const { title, text, tag, isPinned } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Text is required." });
    const ann = await Announcement.create({
      title: title?.trim() || "",
      text: text.trim(),
      tag: tag || "general",
      isPinned: isPinned || false,
    });
    res.status(201).json(ann);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const adminUpdate = async (req, res) => {
  try {
    const { title, text, tag, isActive, isPinned } = req.body;
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });
    if (title  !== undefined) ann.title    = title.trim();
    if (text   !== undefined) ann.text     = text.trim();
    if (tag    !== undefined) ann.tag      = tag;
    if (isActive  !== undefined) ann.isActive  = isActive;
    if (isPinned  !== undefined) ann.isPinned  = isPinned;
    await ann.save();
    res.json(ann);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const adminDelete = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
};
