const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

// Middleware JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// 🔹 GET /api/messages/:roomId
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération messages" });
  }
});

// 🔹 POST /api/messages
router.post("/", authMiddleware, async (req, res) => {
  const { room, content } = req.body;
  if (!room || !content)
    return res.status(400).json({ message: "Room et contenu requis" });

  try {
    const message = await Message.create({
      sender: req.user.id,
      room,
      content,
    });
    const populated = await message.populate("sender", "username");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création message" });
  }
});

module.exports = router;
