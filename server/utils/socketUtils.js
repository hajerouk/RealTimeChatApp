const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticateSocket(token) {
  if (!token) throw new Error("No token");
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id).select("-password");
  if (!user) throw new Error("User not found");
  return user;
}

module.exports = { authenticateSocket };
