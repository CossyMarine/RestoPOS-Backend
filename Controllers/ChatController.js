const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

// Helper: always return the single global room
async function getGlobalRoom() {
  let room = await ChatRoom.findOne({ name: "Main Room" });
  if (!room) {
    room = new ChatRoom({ name: "Main Room", isGroup: true });
    await room.save();
  }
  return room;
}

// ✅ Send message (always in global room)
exports.sendMessage = async (req, res) => {
  try {
    const { content, type } = req.body;
    const room = await getGlobalRoom();

    const message = await Message.create({
      chatRoom: room._id,
      sender: req.user._id,
      content,
      type: type || "text",
    });

    const populated = await message.populate("sender", "fullName badge referralLevel");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get messages (from global room only)
exports.getMessages = async (req, res) => {
  try {
    const room = await getGlobalRoom();
    const messages = await Message.find({ chatRoom: room._id })
      .populate("sender", "fullName badge referralLevel")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete message (only by sender)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await message.deleteOne();
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add/remove reaction
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      message.reactions.splice(existingIndex, 1); // remove reaction if already exists
    } else {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    const populated = await message.populate("sender", "fullName badge referralLevel");
    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};