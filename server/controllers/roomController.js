const Room = require("../models/Room");
const User = require("../models/User");

exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const exists = await Room.findOne({ name });
    if (exists)
      return res.status(400).json({ error: "Room name already used" });
    const room = await Room.create({
      name,
      description,
      isPrivate,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create room failed" });
  }
};

exports.listRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .select("-__v")
      .populate("createdBy", "username")
      .lean();
    const withCounts = rooms.map((r) => ({
      ...r,
      memberCount: r.members.length,
    }));
    res.json(withCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "List rooms failed" });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ ok: true, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Join failed" });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    room.members = room.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await room.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leave failed" });
  }
};
