require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes REST
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// === SOCKET.IO ===
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ton frontend React
    methods: ["GET", "POST"],
  },
});

// Middleware d’authentification Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // on stocke l’utilisateur dans le socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Gestion des connexions
io.on("connection", (socket) => {
  console.log(`✅ ${socket.user.username} connecté (${socket.id})`);

  // 🔹 Rejoindre une room
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.user.username} a rejoint la room ${roomId}`);
  });

  // 🔹 Envoyer un message
  socket.on("message:send", async ({ roomId, content }) => {
    if (!content.trim()) return;

    const Message = require("./models/Message");
    const newMsg = await Message.create({
      sender: socket.user.id,
      room: roomId,
      content,
    });

    // Émettre à tous les membres de la room
    io.to(roomId).emit("message:new", {
      sender: { username: socket.user.username },
      content,
    });
  });

  // 🔹 Déconnexion
  socket.on("disconnect", () => {
    console.log(`❌ ${socket.user.username} déconnecté`);
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
