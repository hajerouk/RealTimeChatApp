require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connecté à MongoDB");

    // Ajoute le champ role à tous les users existants
    await User.updateMany({}, { $set: { role: "user" } });

    // Exemple pour créer un superadmin
    const admin = await User.findOneAndUpdate(
      { username: "superadmin" },
      { role: "superadmin" },
      { new: true }
    );
    console.log("🎩 Superadmin mis à jour :", admin);

    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Erreur :", err));
