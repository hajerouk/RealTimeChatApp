require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages"); // ici juste ./routes/messages
const User = require("./models/User");
const Room = require("./models/Room");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes REST
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// Ping test
app.get("/api/ping", (req, res) => res.json({ ok: true }));

// === SOCKET.IO ===
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Gestion connexions Socket.IO
io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log(
    `✅ ${socket.user.username} connecté (${socket.id}) {user role : ${socket.user.role}}`
  );

  socket.on("join-room", async ({ roomId }) => {
    const room = await Room.findById(roomId);
    if (!room) return socket.emit("error", { message: "Room not found" });
    socket.join(roomId);
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
  });

  socket.on("message:send", async ({ roomId, content }) => {
    if (!content || !roomId) return;
    const msg = await Message.create({ sender: userId, room: roomId, content });
    const populated = await msg.populate("sender", "username");
    io.to(roomId).emit("message:new", populated);
  });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    server.listen(PORT, () => console.log(`🚀 Serveur lancé sur ${PORT}`))
  )
  .catch((err) => console.error("❌ Erreur MongoDB", err));
const path = require("path");

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("/*", (req, res) =>
    res.sendFile(path.join(__dirname, "../client/build", "index.html"))
  );
}
