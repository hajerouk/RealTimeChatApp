require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const SUPERADMIN_DATA = {
  username: "admin",
  email: "admin@example.com",
  password: "Admin123!", 
  role: "superadmin",
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connecté à MongoDB");

    let admin = await User.findOne({ username: SUPERADMIN_DATA.username });

    if (admin) {
      admin.role = "superadmin";
      await admin.save();
      console.log("🎩 Superadmin mis à jour :", {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      });
    } else {
      admin = new User(SUPERADMIN_DATA);
      await admin.save();
      console.log("🎉 Nouveau superadmin créé :", {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      });
    }

    mongoose.connection.close();
    console.log("✅ Terminé !");
  })
  .catch((err) => console.error("❌ Erreur :", err));
