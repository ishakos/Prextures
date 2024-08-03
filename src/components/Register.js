//npm install formik
//npm install yup
import React from "react";
import "../css/login.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";

export default function Register() {
  const [listOfUsers, setListOfUsers] = useState([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/users").then((response) => {
      setListOfUsers(response.data.users);
    });
  }, []);

  const initialValues = {
    username: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required()
      .min(3)
      .max(15)
      .test({
        name: "unique-username",
        message: () => {
          return "Username already exists";
        },
        test: (value) => {
          return !checkUsername(value);
        },
      })
      .matches(/^\S*$/, "Username should not contain spaces"),
    email: Yup.string()
      .required()
      .email()
      .test({
        name: "unique-email",
        message: () => {
          return "Email already exists";
        },
        test: (value) => {
          return !checkEmail(value);
        },
      }),
    password: Yup.string().required().min(3).max(15),
  });

  //small note: forEach daretly problem m3a l validation
  function checkUsername(username) {
    for (let i = 0; i < listOfUsers.length; i++) {
      if (listOfUsers[i].username === username) {
        return true;
      }
      return false;
    }
  }

  function checkEmail(email) {
    for (let i = 0; i < listOfUsers.length; i++) {
      if (listOfUsers[i].email === email) {
        return true;
      }
      return false;
    }
  }

  const onSubmit = (data) => {
    axios.post("http://localhost:3001/users", data).then(() => {});
    setSent(true);
  };

  return (
    <>
      {sent ? (
        <Registered />
      ) : (
        <div className="login-page">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            validateOnChange={false}
            className="login-page"
          >
            <Form className="form">
              <Input type={"username"} />
              <Input type={"email"} />
              <Input type={"password"} />
              <button type="submit" className="register">
                REGISTER
              </button>
            </Form>
          </Formik>
        </div>
      )}
    </>
  );
}

function Input({ type }) {
  return (
    <div className="login-form">
      <ErrorMessage name={type} component="span" className={"error-" + type} />
      <Field
        autoComplete="off"
        id={"unique-" + type}
        name={type}
        type={type}
        placeholder={"Put your " + type}
      />
    </div>
  );
}

function Registered() {
  return (
    <div className="login-page">
      <div className="form">
        <span className="sent" style={{ textAlign: "center" }}>
          Please verify your email
        </span>
        <span className="sent" style={{ textAlign: "center" }}>
          If you dont verify it your account will be deleted within 24 hours.
        </span>
        <Link style={{ fontWeight: "bold" }} to="/Prextures">
          Go back home
        </Link>
      </div>
    </div>
  );
}
