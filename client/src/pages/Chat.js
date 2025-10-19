import React, { useEffect, useState } from "react";
import { initSocket } from "../utils/socket";
import axios from "../api/axios";
import { FaPlus, FaHistory } from "react-icons/fa";
import "../styles/styles.css"; // ton fichier CSS séparé

const Chat = () => {
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Décode le JWT pour récupérer le username
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const username = user?.username || "Anonyme";

  // Initiale pour l’avatar
  const getInitials = (name) => (name ? name[0].toUpperCase() : "?");

  // 🔹 Connexion Socket.IO
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  // 🔹 Charger les rooms depuis l’API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data);
      } catch (err) {
        console.error("Erreur chargement rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  // 🔹 Rejoindre une room
  const joinRoom = async (room) => {
    if (!socket) return;
    setSelectedRoom(room);
    setMessages([]);
    socket.emit("join-room", { roomId: room._id });

    try {
      const res = await axios.get(`/messages/${room._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  // 🔹 Créer une nouvelle room
  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await axios.post("/rooms", { name: newRoom });
      setRooms((prev) => [...prev, res.data]);
      setNewRoom("");
    } catch (err) {
      console.error("Erreur création room:", err);
    }
  };

  // 🔹 Quitter une room
  const leaveRoom = () => {
    if (!socket || !selectedRoom) return;
    socket.emit("leave-room", { roomId: selectedRoom._id });
    setSelectedRoom(null);
    setMessages([]);
  };

  // 🔹 Historique
  const fetchHistory = async () => {
    if (!selectedRoom) return;
    try {
      const res = await axios.get(`/messages/${selectedRoom._id}`);
      console.log("Historique:", res.data); // debug
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur récupération historique:", err);
    }
  };

  // 🔹 Écoute des messages en temps réel
  useEffect(() => {
    if (!socket) return;
    socket.on("message:new", (msg) => {
      if (msg.room === selectedRoom?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("message:new");
  }, [socket, selectedRoom]);

  // 🔹 Envoyer un message
  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !selectedRoom) return;
    socket.emit("message:send", {
      roomId: selectedRoom._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      {/* === Sidebar gauche === */}
      <div className="sidebar">
        {/* Avatar utilisateur */}
        <div className="user-avatar-container">
          <span className="avatar">{getInitials(username)}</span>
          <span className="username">{username}</span>
        </div>

        <h3>Rooms</h3>
        <div className="room-list">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="room-item"
              onClick={() => joinRoom(room)}
            >
              <span>{room.name}</span>
              <div className="room-info">
                <p>
                  <strong>Créé par:</strong>{" "}
                  {room.createdBy?.username || "Anonyme"}
                </p>
                <p>
                  <strong>Membres:</strong>{" "}
                  {room.members.map((m) => m.username).join(", ") || "Aucun"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Création de room */}
        <div className="new-room-container">
          <input
            type="text"
            placeholder="Nouvelle room"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
          />
          <button onClick={handleCreateRoom}>
            <FaPlus />
          </button>
        </div>
      </div>

      {/* === Zone principale === */}
      <div className="chat-area">
        {selectedRoom ? (
          <>
            <div className="room-header">
              <h2 className="room-title">{selectedRoom.name}</h2>
              <button onClick={leaveRoom} className="leave-room-button">
                Quitter la room
              </button>
              <button onClick={fetchHistory} className="history-button">
                <FaHistory /> Historique
              </button>
            </div>

            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className="message">
                  <strong>{msg.sender?.username || "Anonyme"}:</strong>{" "}
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="input-container">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <p className="no-room-selected">
            👈 Sélectionne une room ou crée-en une nouvelle !
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
