import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
export default function EmailConfirmation() {
  const url = window.location.href.split("/");
  const token = url[url.length - 1];
  const username = url[url.length - 2];
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = { username: username, token: token };
    axios
      .post(
        "http://localhost:3001/users/emailVerification/:username/:token",
        data
      )
      .then((response) => {
        if (response.data.message) {
          setUpdated(true);
        } else {
          setUpdated(false);
        }
        setLoading(false);
      });
  }, [username, token]);

  return (
    <>
      <div className="login-page">
        {loading ? (
          <div className="emailVer">
            <h1 className="emailV">Verifying...</h1>
          </div>
        ) : (
          <>
            {updated ? (
              <div className="emailVer">
                <h1 className="emailV">Email Verified</h1>
              </div>
            ) : (
              <div className="emailVer">
                <h1 className="emailV">
                  Link Expired, Your account is automaticly deleted
                </h1>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
