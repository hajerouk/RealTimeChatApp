const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", authMiddleware, authCtrl.logout);

// optional: /me
router.get("/me", authMiddleware, (req, res) => res.json(req.user));

module.exports = router;
