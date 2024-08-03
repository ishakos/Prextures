import React from "react";
import "../css/home.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="welcome-title">WELCOME TO PREXTURES</h1>
        <h2 className="welcome-text">
          Make your own predictions for every PL match. Whether you’re a
          seasoned football fan or a casual viewer. Dive into the action, and
          enjoy the thrill of predicting Premier League fixtures!
        </h2>
        <button className="welcome-button">
          <Link to={"/login"}>Start Now</Link>
        </button>
      </div>
    </div>
  );
}
