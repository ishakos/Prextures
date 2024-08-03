import React from "react";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  let navigate = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [updated, setUpdated] = useState(false);
  const [error1, setError1] = useState(false);
  const [errormsg, setErrormsg] = useState("");

  const reset = () => {
    setError1(false);
    setErrormsg("");
    let currentURL = window.location.href.split("/");
    const id = currentURL[currentURL.length - 2];
    const token = currentURL[currentURL.length - 1];
    const data = {
      password: newPass,
      password2: newPass2,
      id: id,
      token: token,
    };
    if (newPass.length <= 3 || newPass2.length <= 3) {
      setError1(true);
      setErrormsg("Password must be above 3 characters!");
    } else if (newPass !== newPass2) {
      setError1(true);
      setErrormsg("Password does not match!");
    } else {
      axios
        .post("http://localhost:3001/login/reset/:id/:token", data)
        .then((response) => {
          if (response.data.updated) {
            setUpdated(true);
          } else if (response.data.noMatch) {
            setError1(true);
            setErrormsg("Passwords does not match");
          } else {
            alert("link expired");
            navigate("/Prextures");
          }
        });
    }
  };

  return (
    <div className="login-page">
      <div className="form">
        {updated ? (
          <Updated />
        ) : (
          <ResetPassForm
            error1={error1}
            setError1={setError1}
            errormsg={errormsg}
            setNewPass={setNewPass}
            setNewPass2={setNewPass2}
            reset={reset}
          />
        )}
      </div>
    </div>
  );
}

function Updated() {
  return (
    <>
      <span className="sent" style={{ textAlign: "center" }}>
        Password updated succesfully
      </span>
      <Link style={{ fontWeight: "bold" }} to="/Prextures">
        Go back home
      </Link>
    </>
  );
}

function ResetPassForm({
  errormsg,
  error1,
  setError1,
  setNewPass,
  setNewPass2,
  reset,
}) {
  return (
    <div className="login-form">
      <Hint error={error1} errormsg={errormsg} />
      <input
        type="password"
        placeholder="Enter your password"
        onSelect={() => {
          setError1(() => !true);
        }}
        onChange={(event) => {
          setNewPass(event.target.value);
        }}
      />
      <input
        type="password"
        placeholder="Re-Enter your password"
        onSelect={() => {
          setError1(() => !true);
        }}
        onChange={(event) => {
          setNewPass2(event.target.value);
        }}
      />
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function Hint({ error1, errormsg }) {
  return (
    <> {error1 ? <span className="error-username">{errormsg}</span> : <></>}</>
  );
}
