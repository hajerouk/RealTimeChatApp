import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", formData);

      // Sauvegarde du token JWT
      localStorage.setItem("token", res.data.token);

      // Redirection vers le chat
      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect."
      );
    }
  };

  return (
    <div style={styles.container}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Se connecter
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Pas encore de compte ? <Link to="/register">S’inscrire</Link>
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
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    background: "#28a745",
    color: "white",
    cursor: "pointer",
  },
};

export default Login;
