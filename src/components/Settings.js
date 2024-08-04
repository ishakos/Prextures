import React from "react";
import "../css/settings.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("accessToken"));
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  //image input
  const [imageUpload, setImageUpload] = useState(null);
  //current visible profile pic
  const [imageUrl, setImageUrl] = useState("defaults/png");
  //true = user uses a personal pfp
  const [pfp, setPfp] = useState(false);
  const [delet, setDelete] = useState(false);
  const [error, setError] = useState("");
  let navigate = useNavigate();

  //Verifying the token + setting the user (1st render)
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("User Not Logged In");
      navigate("/login");
    }
    axios
      .get("https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/login/auth", {
        headers: { accessToken: token || "" },
      })
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setUser(response.data);
        }
      });
  }, [navigate]);

  //whenever token is deleted we perform an action
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === sessionStorage && event.key === "accessToken") {
        if (event.newValue === null) {
          setToken(null);
          alert("User Not Logged In");
          navigate("/login");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    //cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, navigate]);

  //figuring which image we're gonna use for the user
  useEffect(() => {
    let path;
    if (user) {
      path = user.image;
    } else {
      path = "defaults/png";
    }
    const father = path.split("/")[0];
    const imageRef = ref(storage, `${father}/`);
    listAll(imageRef).then((response) => {
      response.items.forEach((item) => {
        if (item.fullPath === `${father}/pfp`) {
          getDownloadURL(item).then((url) => {
            //if user has personal pfp <==> hes not using the default pic
            if (father !== "defaults") {
              setPfp(true);
            }
            //otherwise he is using the default one (pfp state = false)
            setImageUrl(url);
          });
          return;
        }
      });
    });
  }, [user, imageUrl]);

  //reset the error message
  useEffect(() => {
    setError("");
  }, [newPass, newPass2]);

  const uploadFile = () => {
    setError("");
    if (user == null || imageUpload == null) return;
    const newPath = `${user._id}/pfp`;
    const imageRef = ref(storage, newPath);
    //uploading the new image with a new path
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        //updaing the ui + user.image in db
        setImageUrl(url);
        setPfp(true);
        const config = {
          headers: {
            accessToken: sessionStorage.getItem("accessToken") || "",
          },
        };
        const data = {
          path: newPath,
        };
        axios
          .post("https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/profile/pfp", data, config)
          .then(() => {});
      });
    });
  };

  const deleteImage = () => {
    //deleting user pfp
    const storageRef = ref(storage, `/${user._id}/pfp`);
    getMetadata(storageRef)
      .then(() => {
        deleteObject(storageRef);
        setPfp(false);
        setError("Image deleted");
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          setError("File does not exist");
        } else {
          setError("Error checking file existence", error);
        }
      });
    //reuse the default pic after the user pfp is deleted
    const imageRef = ref(storage, `defaults/`);
    listAll(imageRef).then((response) => {
      response.items.forEach((item) => {
        if (item.fullPath === `defaults/pfp`) {
          getDownloadURL(item).then((url) => {
            setImageUrl(url);
          });
          return;
        }
      });
    });
  };

  const deleteAcc = () => {
    axios
      .post(
        "https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/profile/deleteacc",
        {},
        {
          headers: {
            accessToken: sessionStorage.getItem("accessToken") || "",
          },
        }
      )
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
        } else {
          alert("Account deleted");
          navigate("/");
        }
      });
    deleteImage();
  };

  //reset password
  const reset = () => {
    const data = {
      password: newPass,
      password2: newPass2,
    };
    const config = {
      headers: {
        accessToken: sessionStorage.getItem("accessToken") || "",
      },
    };
    if (newPass.length <= 3 || newPass2.length <= 3) {
      setError("password must be above 3 characters");
    } else if (newPass !== newPass2) {
      setError("Passwords dosent match!");
    } else {
      axios
        .post("https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/profile/resetpassword", data, config)
        .then((response) => {
          if (response.data.error) {
            setError(response.data.error);
          } else if (response.data.noMatch) {
            setError(response.data.noMatch);
          } else {
            setError("Password updated!");
          }
        });
    }
  };

  return (
    <>
      {user ? (
        <div className="settings">
          <div className="container">
            <LeftSide>
              <UserData user={user} />
              <ResetPasswordForm
                setNewPass={setNewPass}
                setNewPass2={setNewPass2}
                reset={reset}
              />
              <div className="deleteButton">
                <DeleteAccountButton
                  setDelete={setDelete}
                  delet={delet}
                  deleteAcc={deleteAcc}
                />
              </div>
              ;
            </LeftSide>
            <RightSide>
              <ProfileImg imageUrl={imageUrl} />
              <ChangeProfilePic
                pfp={pfp}
                imageUpload={imageUpload}
                setImageUpload={setImageUpload}
                uploadFile={uploadFile}
                deleteImage={deleteImage}
              />
            </RightSide>
          </div>
          <Hint error={error} />
        </div>
      ) : (
        <p>Fetching data...</p>
      )}
    </>
  );
}

function LeftSide({ children }) {
  return <div className="user-infos">{children}</div>;
}

function RightSide({ children }) {
  return <div className="pfp">{children}</div>;
}

function UserData({ user }) {
  return (
    <div className="user-data">
      <p>
        Username : <span>{user.username}</span>
      </p>
      <p>
        Email :{" "}
        <span>
          {" "}
          {`${user.email.split("@")[0][0]}${user.email.split("@")[0][1]}*****@${
            user.email.split("@")[1]
          }`}
        </span>
      </p>
    </div>
  );
}

function ResetPasswordForm({ setNewPass, setNewPass2, reset }) {
  return (
    <div className="resetPassword">
      <input
        type="password"
        placeholder="enter your new password"
        required
        minLength="3"
        onChange={(event) => {
          setNewPass(event.target.value);
        }}
      />
      <input
        type="password"
        placeholder="re-enter your new password"
        required
        minLength="3"
        onChange={(event) => {
          setNewPass2(event.target.value);
        }}
      />
      <button className="button-14" type="submit" onClick={reset}>
        Reset Password
      </button>
    </div>
  );
}

function DeleteAccountButton({ setDelete, delet, deleteAcc }) {
  return (
    <>
      <button
        className="button-24"
        onClick={() => setDelete((delet) => !delet)}
      >
        Delete Account?
      </button>
      {delet ? (
        <>
          <button
            className="button-14"
            onClick={() => setDelete((delet) => !delet)}
          >
            no
          </button>
          <button className="button-14" type="submit" onClick={deleteAcc}>
            yes
          </button>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

function ProfileImg({ imageUrl }) {
  return (
    <>
      <>
        <label>Change your profile picture</label>
        {imageUrl === "defaults/png" ? (
          <p>image loading...</p>
        ) : (
          <div
            className="dembele"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "50% 50%",
              width: "60px", // Add width and height to see the background image
              height: "60px",
              borderRadius: "100%",
            }}
          ></div>
        )}
      </>
    </>
  );
}

function ChangeProfilePic({
  pfp,
  imageUpload,
  setImageUpload,
  uploadFile,
  deleteImage,
}) {
  return (
    <>
      <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      {imageUpload ? <SaveImageButton uploadFile={uploadFile} /> : <></>}
      {pfp ? <DeleteImageButton deleteImage={deleteImage} /> : <></>}
    </>
  );
}

function SaveImageButton({ uploadFile }) {
  return (
    <button className="button-25" onClick={uploadFile}>
      Save Image
    </button>
  );
}

function DeleteImageButton({ deleteImage }) {
  return (
    <button className="button-24" onClick={deleteImage}>
      Delete image
    </button>
  );
}

function Hint({ error }) {
  return (
    <p
      className="unexpected"
      style={{ textAlign: "center", fontWeight: "500", fontSize: "18px" }}
    >
      {error}
    </p>
  );
}
