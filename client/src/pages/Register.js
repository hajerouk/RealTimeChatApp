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
    <div style={styles.container}>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputContainer}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.username && (
            <small style={styles.error}>{errors.username}</small>
          )}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.email && <small style={styles.error}>{errors.email}</small>}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          {errors.password && (
            <small style={styles.error}>{errors.password}</small>
          )}
        </div>

        <button type="submit" style={styles.button}>
          S'inscrire
        </button>
      </form>

      {success && <p style={styles.success}>{success}</p>}

      <p>
        Déjà un compte ? <Link to="/">Se connecter</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "0.8rem",
    marginTop: "2px",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
};

export default Register;
