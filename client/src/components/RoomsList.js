import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

function RoomsList({ user, token, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get("http://localhost:5000/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    };
    fetchRooms();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette room ?")) return;
    await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRooms((prev) => prev.filter((r) => r._id !== id));
  };

  const handleRename = async (id) => {
    const newName = prompt("Nouveau nom de la room :");
    if (!newName) return;
    const res = await axios.put(
      `http://localhost:5000/api/rooms/${id}`,
      { name: newName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRooms((prev) =>
      prev.map((r) => (r._id === id ? { ...r, name: res.data.name } : r))
    );
  };

  return (
    <div className="rooms-list">
      <h3>Rooms disponibles</h3>
      <ul>
        {rooms.map((room) => (
          <li
            key={room._id}
            onClick={() => onSelectRoom(room)}
            title={
              user.role === "superadmin"
                ? `Créée par: ${
                    room.createdBy?.username || "Inconnu"
                  } | Membres: ${room.members?.length || 0}`
                : ""
            }
          >
            {room.name}

            {user.role === "superadmin" && (
              <span className="admin-actions">
                <FaEdit
                  style={{ marginLeft: 8, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(room._id);
                  }}
                />
                <FaTrash
                  style={{ marginLeft: 8, cursor: "pointer", color: "red" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(room._id);
                  }}
                />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomsList;
