// server/middlewares/adminMiddleware.js
module.exports = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Accès refusé : super admin seulement" });
  }
  next();
};
