import { io } from "socket.io-client";

// Le backend tourne sur le port 5000
const SOCKET_URL = "http://localhost:5000";

// Fonction pour créer et configurer le socket
export const initSocket = (token) => {
  const socket = io(SOCKET_URL, {
    auth: { token }, // envoie le JWT pour authentifier la connexion
    transports: ["websocket"], // force le protocole websocket
  });

  socket.on("connect", () => {
    console.log("✅ Connecté au serveur Socket.IO");
  });

  socket.on("disconnect", () => {
    console.log("❌ Déconnecté du serveur Socket.IO");
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Erreur de connexion Socket.IO :", err.message);
  });

  return socket;
};
