const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔐 Génération du token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// 🟢 REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "Champs manquants" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ error: "Utilisateur déjà existant" });

    const user = new User({
      username,
      email,
      password,
      role: role || "user", // 👈 par défaut "user"
    });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ error: "Erreur inscription" });
  }
};

// 🟢 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Champs manquants" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Identifiants invalides" });

    const token = generateToken(user);
    await User.findByIdAndUpdate(user._id, { online: true });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur connexion" });
  }
};

// 🟢 LOGOUT
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { online: false });
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur logout:", err);
    res.status(500).json({ error: "Erreur déconnexion" });
  }
};
