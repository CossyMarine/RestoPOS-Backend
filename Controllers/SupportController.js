import SupportTicket from "../models/SupportTicket.js";
import TicketCategory from "../models/TicketCategory.js";

// ── Categories ────────────────────────────────────────────────────

export const getCategories = async (req, res) => {
  try {
    const cats = await TicketCategory.find({ isVisible: true }).sort({ order: 1, createdAt: 1 });
    res.json(cats);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const getAllCategories = async (req, res) => {
  try {
    const cats = await TicketCategory.find().sort({ order: 1, createdAt: 1 });
    res.json(cats);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const createCategory = async (req, res) => {
  try {
    const { label } = req.body;
    if (!label?.trim()) return res.status(400).json({ message: "Label is required." });
    const cat = await TicketCategory.create({ label: label.trim() });
    res.status(201).json(cat);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const updateCategory = async (req, res) => {
  try {
    const cat = await TicketCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const deleteCategory = async (req, res) => {
  try {
    await TicketCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── Tickets (User) ────────────────────────────────────────────────

export const createTicket = async (req, res) => {
  try {
    const { title, description, categoryId, file } = req.body;
    if (!title?.trim() || !description?.trim())
      return res.status(400).json({ message: "Title and description required." });

    const firstMessage = {
      sender: "user",
      text: description.trim(),
      seenByAdmin: false,
      seenByUser: true,
      ...(file ? { file } : {}),
    };

    const ticket = await SupportTicket.create({
      user: req.user._id,
      title: title.trim(),
      categoryId: categoryId || null,
      description: description.trim(),
      messages: [firstMessage],
    });

    res.status(201).json(ticket);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title status createdAt updatedAt messages");
    res.json(tickets);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id })
      .populate("user", "fullName email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Mark all admin messages as seen by user
    let changed = false;
    ticket.messages.forEach(m => {
      if (m.sender === "admin" && !m.seenByUser) { m.seenByUser = true; changed = true; }
    });
    if (changed) await ticket.save();

    res.json(ticket);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const userReply = async (req, res) => {
  try {
    const { text, file } = req.body;
    if (!text?.trim() && !file) return res.status(400).json({ message: "Message cannot be empty." });

    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status === "closed") return res.status(400).json({ message: "Ticket is closed." });

    ticket.messages.push({
      sender: "user",
      text: text?.trim() || "",
      seenByAdmin: false,
      seenByUser: true,
      ...(file ? { file } : {}),
    });
    if (ticket.status === "closed") ticket.status = "open";
    await ticket.save();
    res.json(ticket);
  } catch { res.status(500).json({ message: "Server error" }); }
};

// Unread count for user bottom nav badge
export const getUserUnreadCount = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id });
    let count = 0;
    tickets.forEach(t => {
      t.messages.forEach(m => {
        if (m.sender === "admin" && !m.seenByUser) count++;
      });
    });
    res.json({ count });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// ── Tickets (Admin) ───────────────────────────────────────────────

export const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await SupportTicket.find(filter)
      .populate("user", "fullName email")
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const getAdminTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("user", "fullName email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Mark all user messages as seen by admin
    let changed = false;
    ticket.messages.forEach(m => {
      if (m.sender === "user" && !m.seenByAdmin) { m.seenByAdmin = true; changed = true; }
    });
    if (changed) await ticket.save();

    res.json(ticket);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const adminReply = async (req, res) => {
  try {
    const { text, file } = req.body;
    if (!text?.trim() && !file) return res.status(400).json({ message: "Message cannot be empty." });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({
      sender: "admin",
      text: text?.trim() || "",
      seenByAdmin: true,
      seenByUser: false,
      ...(file ? { file } : {}),
    });
    if (ticket.status === "open") ticket.status = "in_progress";
    await ticket.save();
    res.json(ticket);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate("user", "fullName email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch { res.status(500).json({ message: "Server error" }); }
};

export const deleteTicket = async (req, res) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Server error" }); }
};

// Admin unread count (user messages unseen by admin)
export const getAdminUnreadCount = async (req, res) => {
  try {
    const tickets = await SupportTicket.find();
    let count = 0;
    tickets.forEach(t => {
      t.messages.forEach(m => {
        if (m.sender === "user" && !m.seenByAdmin) count++;
      });
    });
    res.json({ count });
  } catch { res.status(500).json({ message: "Server error" }); }
};
