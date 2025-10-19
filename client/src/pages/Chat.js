import React, { useEffect, useState } from "react";
import { initSocket } from "../utils/socket";
import axios from "../api/axios";
import { FaPlus, FaHistory, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/styles.css";

const Chat = () => {
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const profile = user?.role || "user";
  const username = user?.username || "Anonyme";
  const isAdmin = user?.role === "superadmin";

  const getInitials = (name) => (name ? name[0].toUpperCase() : "?");

  // Charger rooms depuis l'API
  const fetchRooms = async () => {
    try {
      const res = await axios.get("/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Erreur chargement rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Connexion Socket.IO
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);

    return () => s.disconnect();
  }, [token]);

  // Rejoindre une room
  const joinRoom = async (room) => {
    if (!socket) return;
    setSelectedRoom(room);
    setMessages([]);
    socket.emit("join-room", { roomId: room._id });

    /* try {
      const res = await axios.get(`/messages/${room._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    } */
  };

  // Envoyer un message
  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !selectedRoom) return;
    socket.emit("message:send", {
      roomId: selectedRoom._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  // Ajouter une room (super admin)
  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await axios.post(
        "/rooms",
        { name: newRoom },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms((prev) => [...prev, res.data]);
      setNewRoom("");
    } catch (err) {
      console.error("Erreur création room:", err);
    }
  };
  // Modifier le nom d'une room (super admin)
  const handleEditRoom = async (room) => {
    const newName = prompt("Nouveau nom de la room:", room.name);
    if (!newName) return;
    try {
      const res = await axios.put(
        `/rooms/${room._id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRooms((prev) => prev.map((r) => (r._id === room._id ? res.data : r)));
      if (selectedRoom?._id === room._id) setSelectedRoom(res.data);
    } catch (err) {
      console.error("Erreur modification room:", err);
    }
  };

  // Supprimer une room (super admin)
  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Supprimer la room "${room.name}" ?`)) return;
    try {
      await axios.delete(`/rooms/${room._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms((prev) => prev.filter((r) => r._id !== room._id));
      if (selectedRoom?._id === room._id) setSelectedRoom(null);
    } catch (err) {
      console.error("Erreur suppression room:", err);
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (!socket || !selectedRoom) return;
    socket.emit("leave-room", { roomId: selectedRoom._id });
    setSelectedRoom(null);
    setMessages([]);
  };

  // Historique messages
  const fetchHistory = async () => {
    if (!selectedRoom) return;
    try {
      const res = await axios.get(`/messages/${selectedRoom._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur récupération historique:", err);
    }
  };

  // Écoute des nouveaux messages
  useEffect(() => {
    if (!socket) return;
    socket.on("message:new", (msg) => {
      if (msg.room === selectedRoom?._id) setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("message:new");
  }, [socket, selectedRoom]);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
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

              {/* Info-bulle visible uniquement pour superadmin */}
              {user?.role === "superadmin" && (
                <div className="room-info-tooltip">
                  <p>
                    <strong>Créé par:</strong>{" "}
                    {room.createdBy?.username || "Anonyme"}
                  </p>
                  <p>
                    <strong>Membres:</strong> {room.members.length}
                  </p>
                </div>
              )}

              {/* Boutons admin (modifier/supprimer) */}
              {user?.role === "superadmin" && (
                <div className="admin-room-buttons">
                  <button onClick={() => handleEditRoom(room)}>✏️</button>
                  <button onClick={() => handleDeleteRoom(room._id)}>🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ajouter une room (super admin) */}
        {isAdmin && (
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
        )}
      </div>

      {/* Zone principale */}
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
