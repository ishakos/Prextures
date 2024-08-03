import React from "react";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";

//hdi kan lzm tkon bera
const headerItems = [
  {
    id: 1,
    name: "Player",
    location: "player",
    actv: "active",
  },
  {
    id: 2,
    name: "Scores",
    location: "scores",
    actv: "",
  },
  {
    id: 3,
    name: "Settings",
    location: "settings",
    actv: "",
  },
];

export default function Main() {
  const [selectedPage, setSelectedPage] = useState(1);
  const [head, setHead] = useState(false);
  //current visible profile pic
  const [imageUrl, setImageUrl] = useState("defaults/png");
  const [userImage, setUserImage] = useState(null);
  let navigate = useNavigate();

  function handleSelectPage(id) {
    setSelectedPage(id);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [selectedPage]);

  //Document Title
  useEffect(
    function () {
      if (!selectedPage) return;
      else {
        switch (selectedPage) {
          case 1:
            document.title = `Player`;
            break;
          case 2:
            document.title = `Scores`;
            break;
          case 3:
            document.title = `Settings`;
            break;
          default:
            return;
        }
      }
      //cleanup function
      return function () {
        document.title = "Player";
      };
    },
    [selectedPage]
  );

  //Verifying the token + fetch user image (1st render)
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("User Not Logged In");
      navigate("/Prextures/login");
    }
    axios
      .get("http://localhost:3001/login/auth", {
        headers: { accessToken: token || "" },
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data);
        } else {
          setUserImage(response.data.image);
        }
      });
  }, [navigate]);

  //figuring which image we're gonna use for the user
  useEffect(() => {
    let path;
    if (userImage) {
      path = userImage;
    } else {
      path = "defaults/png";
    }
    const father = path.split("/")[0];
    const imageRef = ref(storage, `${father}/`);
    listAll(imageRef).then((response) => {
      response.items.forEach((item) => {
        if (item.fullPath === `${father}/pfp`) {
          getDownloadURL(item).then((url) => {
            setImageUrl(url);
          });
          return;
        }
      });
    });
  }, [userImage, imageUrl]);

  return (
    <>
      <header>
        <ProfilePic imageUrl={imageUrl} />
        <List
          onSelectedPage={handleSelectPage}
          head={head}
          setHead={setHead}
          headerItems={headerItems}
          imageUrl={imageUrl}
        />
        <Link to="/Prextures/login" className="login">
          Logout
        </Link>
        <Hamburger head={head} setHead={setHead} />
      </header>
      <Outlet />
    </>
  );
}

function ProfilePic({ imageUrl }) {
  return (
    <div
      className="logo"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "50% 50%",
        width: "60px", // Add width and height to see the background image
        height: "60px",
        borderRadius: "100%",
      }}
    >
      {" "}
      {imageUrl === "defaults/png" ? <p>image loading...</p> : <></>}
    </div>
  );
}

function Hamburger({ head, setHead }) {
  return (
    <span onClick={() => setHead(!head)}>
      {head ? (
        <i className="fa-solid fa-xmark"></i>
      ) : (
        <i className="fa-solid fa-bars"></i>
      )}
    </span>
  );
}

function List({ onSelectedPage, head, setHead, headerItems, imageUrl }) {
  return (
    <ul
      className="computer"
      style={{
        bottom: head ? `calc(-200% - 20px)` : `calc(-100% + 1000px)`,
      }}
    >
      {headerItems?.map((item) => (
        <Item
          name={item.name}
          location={item.location}
          actv={item.actv}
          key={item.id}
          item={item}
          onSelectedPage={onSelectedPage}
          setHead={setHead}
          headerItems={headerItems}
        />
      ))}
      {/* you have to click on the text bah temchi */}
      <SpecialLogin />
    </ul>
  );
}

function SpecialLogin() {
  return (
    <li className="specialLiLogin">
      <Link
        style={{ display: "block", textAlign: "start" }}
        to="/Prextures/login"
        className="login-yo"
      >
        Logout
      </Link>
    </li>
  );
}

function Item({
  name,
  location,
  actv,
  item,
  onSelectedPage,
  setHead,
  headerItems,
}) {
  return (
    <li className={actv}>
      <Link
        onClick={() => {
          for (let index = 0; headerItems.length; ++index) {
            if (index === headerItems.length) {
              break;
            }
            headerItems[index].actv = "";
          }
          headerItems[item.id - 1].actv = "active";
          onSelectedPage(item.id);
          setHead(false);
        }}
        style={{ display: "block", textAlign: "start" }}
        to={`${location}`}
      >{`${name}`}</Link>
    </li>
  );
}
