import React from "react";
import "../css/login.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [listOfUsers, setListOfUsers] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error1, setError1] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/users").then((response) => {
      setListOfUsers(response.data.users);
    });
  }, []);

  function checkEmail(email) {
    for (let i = 0; i < listOfUsers.length; i++) {
      if (listOfUsers[i].email === email) {
        return true;
      }
    }
    return false;
  }

  const submit = () => {
    setSent(false);
    setError1(false);
    if (!checkEmail(userEmail)) {
      setError1(true);
    } else {
      axios
        .post("http://localhost:3001/login/forgot", { email: userEmail })
        .then((response) => {
          if (response.data.match) {
            setSent(true);
          } else {
            setError1(false);
          }
        });
    }
  };

  return (
    <div className="login-page">
      <div className="form">
        <Form
          setError1={setError1}
          setUserEmail={setUserEmail}
          submit={submit}
          setSent={setSent}
        >
          <Hints sent={sent} error1={error1} />
        </Form>
      </div>
    </div>
  );
}

function Form({ children, setError1, setUserEmail, submit, setSent }) {
  return (
    <div className="login-form">
      {children}
      <input
        type="email"
        placeholder="email"
        onSelect={() => {
          setError1(() => !true);
          setSent(() => !true);
        }}
        onChange={(event) => {
          setUserEmail(event.target.value);
        }}
      />
      <Message submit={submit} />
    </div>
  );
}

function Hints({ error1, sent }) {
  return (
    <>
      {error1 ? (
        <span className="error-username">Email does not exist</span>
      ) : (
        <></>
      )}
      {sent ? (
        <span className="sent">Link sent, resubmit if you dont find it</span>
      ) : (
        <></>
      )}
    </>
  );
}

function Message({ submit }) {
  return (
    <>
      <button onClick={submit}>Submit</button>
      <p className="message">
        Not registered?
        <Link to="/Prextures/register" style={{ display: "block" }}>
          Create an account
        </Link>
      </p>
    </>
  );
}
