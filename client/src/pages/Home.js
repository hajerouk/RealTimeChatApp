import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="wave-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="home-content">
        <h1 className="home-title">
          Bienvenue dans notre <br /> <span>Real Time Chat App 💬</span>
        </h1>
        <p className="home-subtitle">
          Échangez instantanément avec vos amis, créez vos propres salons de
          discussion et profitez d'une expérience fluide et moderne.
        </p>

        <div className="home-buttons">
          <button
            onClick={() => navigate("/login")}
            className="home-btn login-btn"
          >
            Connexion
          </button>
          <button
            onClick={() => navigate("/register")}
            className="home-btn register-btn"
          >
            Inscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
