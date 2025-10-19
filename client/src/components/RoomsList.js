import React, { useEffect, useState } from "react";
import { getRooms, createRoom } from "../api/roomService";

const RoomsList = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");

  // Charger les rooms au montage
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        setError("Erreur de chargement des rooms.");
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const created = await createRoom(newRoom);
      setRooms([...rooms, created]);
      setNewRoom("");
    } catch (err) {
      setError("Impossible de créer la room.");
    }
  };

  return (
    <div style={styles.container}>
      <h3>Liste des rooms</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={styles.list}>
        {rooms.map((room) => (
          <li
            key={room._id}
            style={styles.item}
            onClick={() => onSelectRoom(room)}
          >
            {room.name}
          </li>
        ))}
      </ul>

      <div style={styles.newRoom}>
        <input
          type="text"
          placeholder="Nouvelle room..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleCreateRoom} style={styles.button}>
          ➕
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "250px",
    padding: "10px",
    borderRight: "1px solid #ddd",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  newRoom: {
    display: "flex",
    marginTop: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
  },
  button: {
    padding: "8px 12px",
    background: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default RoomsList;
