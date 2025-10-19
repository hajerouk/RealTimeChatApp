const express = require("express");
const router = express.Router();
const roomCtrl = require("../controllers/roomController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, roomCtrl.createRoom);
router.get("/", auth, roomCtrl.listRooms);
router.post("/:id/join", auth, roomCtrl.joinRoom);
router.post("/:id/leave", auth, roomCtrl.leaveRoom);

module.exports = router;
