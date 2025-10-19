const express = require("express");
const router = express.Router();
const messageCtrl = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

router.get("/room/:roomId", auth, messageCtrl.getRoomMessages);

module.exports = router;
