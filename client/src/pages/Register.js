import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // États pour le formulaire et les erreurs par champ
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // reset l'erreur du champ en cours
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: "", email: "", password: "" });
    setSuccess("");

    try {
      const res = await axios.post("/auth/register", formData);
      setSuccess("Compte créé avec succès !");
      localStorage.setItem("token", res.data.token);
      navigate("/chat");
    } catch (err) {
      const message = err.response?.data?.message || "Une erreur est survenue.";

      // Gestion des erreurs spécifiques par champ
      if (message.toLowerCase().includes("username")) {
        setErrors((prev) => ({
          ...prev,
          username: "Nom d'utilisateur déjà utilisé",
        }));
      } else if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: "Adresse e-mail déjà utilisée",
        }));
      } else {
        // Erreur générale
        alert(message);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Inscription</h2>
        <p className="register-subtitle">Créez votre compte pour commencer</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-input-group">
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              required
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && (
              <small className="register-field-error">
                ⚠ {errors.username}
              </small>
            )}
          </div>

          <div className="register-input-group">
            <input
              type="email"
              name="email"
              placeholder="Adresse e-mail"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <small className="register-field-error">⚠ {errors.email}</small>
            )}
          </div>

          <div className="register-input-group">
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <small className="register-field-error">
                ⚠ {errors.password}
              </small>
            )}
          </div>

          <button type="submit" className="register-submit-btn">
            S'inscrire
          </button>
        </form>

        {success && <p className="register-success">✓ {success}</p>}

        <p className="register-footer">
          Déjà un compte ? <Link to="/">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
