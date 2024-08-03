//npm install react-router-dom
//npm install axios
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./css/Normalize.css";
import "./css/App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import EmailConfirmation from "./components/EmailConfirmation";
import ResetPassword from "./components/ResetPassword";
import Player from "./components/Player";
import Settings from "./components/Settings";
import Scores from "./components/Scores";
import Main from "./components/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Prextures" exact element={<Home />} />
        <Route path="/Prextures/login" exact element={<Login />} />
        <Route path="/Prextures/register" exact element={<Register />} />
        <Route
          path="/Prextures/forgotpassword"
          exact
          element={<ForgotPassword />}
        />
        <Route
          path="/Prextures/login/reset/:id/:token"
          exact
          element={<ResetPassword />}
        />
        <Route
          path="/Prextures/emailVerification/:username/:token"
          exact
          element={<EmailConfirmation />}
        />
        <Route path="Prextures/main" element={<Main />}>
          <Route path="player" exact element={<Player />} />
          <Route path="scores" exact element={<Scores />} />
          <Route path="settings" exact element={<Settings />} />
        </Route>

        <Route path="*" exact element={<>Page Not Found</>} />
      </Routes>
    </Router>
  );
}

export default App;