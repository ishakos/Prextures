import React from "react";
import "../css/player.css";
import "../css/mini-comp/header.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase";

export default function Player() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem("accessToken"));
  const [fixtures, setFixtures] = useState([]);
  //teams data without logo
  const [getClubs, setGetClubs] = useState([]);
  //teams data with their visible logos
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setlectedFixture, setSelectedFixture] = useState(1);
  //used it to put a default value in the inputs
  const [userPredictions, setUserPredictions] = useState([]);
  //array contain condition of each fixture, false = deadline passed
  const [deadlines, setDeadlines] = useState([]);
  const [inputs, setInputs] = useState(
    Array.from({ length: 10 }, () => ({ input1: "", input2: "" }))
  );
  const [error, setError] = useState("Fill the slots");
  let navigate = useNavigate();

  const increment = () => {
    if (setlectedFixture < 38) {
      setSelectedFixture((prevCount) => prevCount + 1);
      setError("Fill the slots");
    }
  };

  const decrement = () => {
    if (setlectedFixture > 1) {
      setSelectedFixture((prevCount) => prevCount - 1);
      setError("Fill the slots");
    }
  };

  const handleInputChange = (index, inputKey, value) => {
    if (/^\d{0,2}$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = { ...newInputs[index], [inputKey]: value };
      setInputs(newInputs);
    }
  };

  //Verifying the token + fetch user + fetch user predictions (1st render)
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("User Not Logged In");
      navigate("/login");
    }
    axios
      .get("https://prexturesserver.onrender.com/login/auth", {
        headers: { accessToken: token || "" },
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data);
        } else {
          setUser(response.data);
        }
      });

    axios
      .get("https://prexturesserver.onrender.com/scores/predictions", {
        headers: { accessToken: token || "" },
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data);
        } else {
          setUserPredictions(response.data.predictions);
          sessionStorage.setItem(
            "userPredictions",
            JSON.stringify(response.data.predictions)
          );
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

  //getting (clubs + fixtures) data
  useEffect(() => {
    axios.get("https://prexturesserver.onrender.com/scores/teams").then((response) => {
      if (response.data.teams) {
        setGetClubs(response.data.teams);
      }
    });

    axios.get("https://prexturesserver.onrender.com/scores/fixtures").then((response) => {
      if (response.data.fixtures) {
        setFixtures(response.data.fixtures);
      }
    });
  }, []);

  //fetch the logos of clubs to set the teams
  useEffect(() => {
    //you can observe it is used with a function and not directly logic
    const fetchImages = async () => {
      let testArray = [];
      if (getClubs.length === 0) {
        return;
      }
      const imagesListRef = ref(storage, "teams/");
      const response = await listAll(imagesListRef);
      const urlPromises = response.items.map((item) => getDownloadURL(item));
      const urls = await Promise.all(urlPromises);
      urls.forEach((url, index) => {
        //this condition to avoid duplicates
        if (!testArray.includes(url) && index <= 19) {
          const newObj = {
            name: getClubs[index]?.name,
            shortname: getClubs[index]?.shortname,
            image: url,
          };
          testArray.push(newObj);
        }
      });
      setTeams(testArray);
    };
    fetchImages();
  }, [getClubs]);

  //set the deadlines states for each fixture + the loading state
  useEffect(() => {
    const dl = [];
    const now = new Date();
    const isoString = now.toISOString();
    if (
      fixtures.length === 38 &&
      getClubs.length === 20 &&
      teams.length === 20 &&
      userPredictions.length === 38
    ) {
      for (let index = 0; index < fixtures.length; index++) {
        if (isoString < fixtures[index].deadline) {
          dl.push(true);
        } else {
          dl.push(false);
        }
      }
      setDeadlines(dl);
      if (dl.length === 38) {
        setLoading(false);
      }
    }
  }, [fixtures, getClubs, teams, userPredictions]);

  //managing the defaults values of the inputs
  useEffect(() => {
    let initialInputs = Array.from({ length: 10 }, () => ({
      input1: "",
      input2: "",
    }));
    if (!loading) {
      if (sessionStorage.getItem("userPredictions")) {
        const userPredictionsStorage = JSON.parse(
          sessionStorage.getItem("userPredictions")
        );
        for (let index = 0; index < initialInputs.length; index++) {
          // if the stored player predictions isnt "-" or empty
          //for exp: "2-1" is valid
          if (
            userPredictionsStorage[setlectedFixture - 1]?.fixturePrediction[
              index
            ] !== "-" &&
            userPredictionsStorage[setlectedFixture - 1]?.fixturePrediction
              .length !== 0
          ) {
            //set the default value of the 1st input of that match
            initialInputs[index].input1 =
              userPredictionsStorage[setlectedFixture - 1].fixturePrediction[
                index
              ].split("-")[0];
            //set the default value of the 2nd input of that match
            initialInputs[index].input2 =
              userPredictionsStorage[setlectedFixture - 1].fixturePrediction[
                index
              ].split("-")[1];
          } else {
            //if the stored player predictions is not valid, make all inputs empty again
            initialInputs = Array.from({ length: 10 }, () => ({
              input1: "",
              input2: "",
            }));
            break;
          }
        }
      }
      setInputs(initialInputs);
    }
  }, [setlectedFixture, loading]);

  const onUpdate = () => {
    let playerData = [];
    for (let i = 0; i < inputs.length; i++) {
      //if not valid, nothing will happen
      if (
        !inputs[i].input1 ||
        !inputs[i].input2 ||
        isNaN(inputs[i].input1) ||
        isNaN(inputs[i].input2) ||
        inputs[i].input1 === "" ||
        inputs[i].input2 === ""
      ) {
        //if the inputs are not valid, were gonna send a request with this playerData
        playerData = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
        break;
      } else {
        //incase user type starting with digit 0, "01" = "1"
        let L = inputs[i].input1,
          R = inputs[i].input2;
        if (L[0] === "0" && L.length > 1) {
          L = L[1];
        }
        if (R[0] === "0" && R.length > 1) {
          R = R[1];
        }
        playerData.push(`${L}-${R}`);
      }
    }
    //function to check the pattern: "10-1" or "2-3"
    function isValidDigitDashDigit(str) {
      const regex = /^\d{1,2}-\d{1,2}$/;
      return regex.test(str);
    }
    //function to check the pattern for each string in the array
    function allStringsMatchSchema(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (!isValidDigitDashDigit(arr[i])) {
          return false;
        }
      }
      return true;
    }
    if (!allStringsMatchSchema(playerData)) {
      setError("invalid predictions, please enter proper digits");
    }
    //if all inputs valid we will send the request
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("User Not Logged In");
      navigate("/login");
    }
    const data = {
      number: setlectedFixture,
      newPrediction: playerData,
    };
    const config = {
      headers: {
        accessToken: token || "",
      },
    };
    axios
      .post("https://prexturesserver.onrender.com/scores/predictions", data, config)
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
        } else {
          //basicly updating the userPredictions that are stored in sessionStorage for a smoother UI
          const userPredictionsStorage = JSON.parse(
            sessionStorage.getItem("userPredictions")
          );
          let updatedFixturePrediction = [];
          for (let index = 0; index < inputs.length; index++) {
            if (inputs[index].input1 === "-" || inputs[index].input2 === "-") {
              //if inputs invalid, the data of that fixture remains the same
              updatedFixturePrediction = [
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                setError("invalid predictions, please enter proper digits"),
              ];
              break;
            } else {
              updatedFixturePrediction.push(
                `${inputs[index].input1}-${inputs[index].input2}`
              );
            }
          }
          //the selected fixture matches = updatedFixturePrediction
          userPredictionsStorage[setlectedFixture - 1].fixturePrediction =
            updatedFixturePrediction;
          //reput the data in the storage
          sessionStorage.setItem(
            "userPredictions",
            JSON.stringify(userPredictionsStorage)
          );
          if (!updatedFixturePrediction.includes("-")) {
            setError("Updated");
          }
        }
      });
  };

  return (
    <>
      {user ? (
        <>
          {loading ? (
            <p>fixtures loading...</p>
          ) : (
            <section className="player">
              <Table>
                <TableHeader
                  decrement={decrement}
                  increment={increment}
                  setlectedFixture={setlectedFixture}
                  fixtures={fixtures}
                >
                  <Deadline
                    fixtures={fixtures}
                    setlectedFixture={setlectedFixture}
                  />
                </TableHeader>
                <TableFooter
                  fixtures={fixtures}
                  setlectedFixture={setlectedFixture}
                  teams={teams}
                  deadlines={deadlines}
                  inputs={inputs}
                  handleInputChange={handleInputChange}
                />
              </Table>
              <SavePrediction onUpdate={onUpdate} />
              <Hints error={error} user={user} />
            </section>
          )}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}

function Table({ children }) {
  return <div className="fixTable">{children}</div>;
}

function TableHeader({ decrement, increment, children }) {
  return (
    <header>
      <button className="move" onClick={decrement}>
        Prev
      </button>
      {children}
      <button className="move" onClick={increment}>
        Next
      </button>
    </header>
  );
}

function Deadline({ fixtures, setlectedFixture }) {
  return (
    <p>
      <span>Gameweek {setlectedFixture} : </span>
      {` ${new Date(fixtures[setlectedFixture - 1].deadline).toLocaleString()}`}
    </p>
  );
}

function TableFooter({
  fixtures,
  setlectedFixture,
  teams,
  deadlines,
  inputs,
  handleInputChange,
}) {
  return (
    <div className="footerP1">
      {fixtures[setlectedFixture - 1].matches.map((match, index) => {
        return (
          <Match key={match.numM}>
            <Team teams={teams} match={match} ground={"home"} />
            <Middle>
              {deadlines[setlectedFixture - 1] ? (
                <Play
                  inputs={inputs}
                  index={index}
                  handleInputChange={handleInputChange}
                />
              ) : (
                <Fulltime
                  fixtures={fixtures}
                  setlectedFixture={setlectedFixture}
                  index={index}
                />
              )}
            </Middle>
            <Team teams={teams} match={match} ground={"away"} />
          </Match>
        );
      })}
    </div>
  );
}

function SavePrediction({ onUpdate }) {
  return (
    <div className="save-button">
      <button className="move" onClick={onUpdate}>
        save
      </button>
    </div>
  );
}

function Hints({ error, user }) {
  return (
    <div className="welcome">
      <p>Fill everything then save - {user.username}</p>
      <p>{error}</p>
    </div>
  );
}

function Match({ children }) {
  return <div className="match">{children}</div>;
}

function Team({ teams, match, ground }) {
  return (
    <>
      {teams.map((team) => {
        if (team.shortname === match[`${ground}`]) {
          return (
            <aside className="team" key={0}>
              {ground === "home" ? (
                <>
                  <p>{team.name}</p>
                  <img src={team.image} alt={team.name} />
                </>
              ) : (
                <>
                  <img src={team.image} alt={team.name} />
                  <p>{team.name}</p>
                </>
              )}
            </aside>
          );
        } else {
          return null;
        }
      })}
    </>
  );
}

function Play({ inputs, index, handleInputChange }) {
  return (
    <>
      <input
        className="num"
        type="text"
        value={inputs[index].input1}
        onChange={(e) => handleInputChange(index, "input1", e.target.value)}
      />
      <label> - </label>
      <input
        className="num"
        type="text"
        value={inputs[index].input2}
        onChange={(e) => handleInputChange(index, "input2", e.target.value)}
      />
    </>
  );
}

function Fulltime({ fixtures, setlectedFixture, index }) {
  return (
    <p
      style={{
        color: "black",
        letterSpacing: "8px",
        fontSize: "22px",
      }}
    >
      {fixtures[setlectedFixture - 1].fullTime[index]}
    </p>
  );
}

function Middle({ children }) {
  return <div className="score">{children}</div>;
}
