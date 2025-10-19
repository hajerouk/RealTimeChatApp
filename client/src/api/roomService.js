import axios from "./axios";

// ✅ Récupérer toutes les rooms
export const getRooms = async () => {
  const res = await axios.get("/rooms");
  return res.data;
};

// ✅ Créer une nouvelle room
export const createRoom = async (name) => {
  const res = await axios.post("/rooms", { name });
  return res.data;
};

// ✅ Rejoindre une room
export const joinRoom = async (roomId) => {
  const res = await axios.post(`/rooms/${roomId}/join`);
  return res.data;
};
