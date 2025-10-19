const Message = require("../models/Message");

exports.getRoomMessages = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const limit = parseInt(req.query.limit || "50", 10);
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate("sender", "username avatarUrl")
      .lean();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch messages failed" });
  }
};
