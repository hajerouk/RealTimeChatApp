const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const authMiddleware = require("../middlewares/authMiddleware"); // vérifie JWT
const adminMiddleware = require("../middlewares/adminMiddleware"); // vérifie superadmin

// GET rooms : accessible à tous
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("createdBy", "username")
      .populate("members", "username");
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération rooms" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Nom requis" });

  try {
    const room = await Room.create({
      name,
      createdBy: req.user.id, // 👈 l’auteur de la création
    });
    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création room" });
  }
});

// 🔹 Modifier une room (super admin uniquement)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const room = await Room.findByIdAndUpdate(id, { name }, { new: true });
    if (!room) return res.status(404).json({ message: "Room introuvable" });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur mise à jour room" });
  }
});

// 🔹 Supprimer une room (super admin uniquement)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: "Room introuvable" });
    res.json({ message: "Room supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression room" });
  }
});

module.exports = router;
