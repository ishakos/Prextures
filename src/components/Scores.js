import React from "react";
import "../css/scores.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase";
import { useNavigate } from "react-router-dom";
export default function Scores() {
  const [token, setToken] = useState(sessionStorage.getItem("accessToken"));
  const [fixtures, setFixtures] = useState([]);
  //teams data without logo
  const [getClubs, setGetClubs] = useState([]);
  //teams data with their visible logos
  const [teams, setTeams] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  //true shows user prediction, false shows real match full-time
  const [scoreSwitch, setScoreSwitch] = useState(true);
  //to color each user prediction (correct = green)
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  //checking the token + getting user predictions (1st render)
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("User Not Logged In");
      navigate("/Prextures/login");
    }
    axios
      .get("http://localhost:3001/scores/predictions", {
        headers: { accessToken: token || "" },
      })
      .then((response) => {
        if (response.data.error) {
          console.log(response.data);
        } else {
          setUserPredictions(response.data.predictions);
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
          navigate("/Prextures/login");
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
    axios.get("http://localhost:3001/scores/teams").then((response) => {
      if (response.data.teams) {
        setGetClubs(response.data.teams);
      }
    });
    axios.get("http://localhost:3001/scores/fixtures").then((response) => {
      if (response.data.fixtures) {
        setFixtures(response.data.fixtures);
      }
    });
  }, []);

  //fetch the logos of clubs to set the teams
  useEffect(() => {
    //you can observe it is used with a function and not directly logic
    const fetchImages = async () => {
      let teamsData = [];
      if (getClubs.length !== 20) return;
      const imagesListRef = ref(storage, "teams/");
      const response = await listAll(imagesListRef);
      const urlPromises = response.items.map((item) => getDownloadURL(item));
      const urls = await Promise.all(urlPromises);
      urls.forEach((url, index) => {
        //this condition to avoid duplicates
        if (!teamsData.includes(url) && index <= 19) {
          const newObj = {
            name: getClubs[index]?.name,
            shortname: getClubs[index]?.shortname,
            image: url,
          };
          teamsData.push(newObj);
        }
      });
      setTeams(teamsData);
    };
    fetchImages();
  }, [getClubs]);

  useEffect(() => {
    const coloring = [];
    if (
      fixtures.length === 38 &&
      teams.length === 20 &&
      userPredictions.length === 38 &&
      getClubs.length === 20
    ) {
      for (let indexF = 0; indexF < fixtures.length; indexF++) {
        let fixcolor = [];
        for (
          let indexM = 0;
          indexM < fixtures[indexF].fullTime.length;
          indexM++
        ) {
          if (fixtures[indexF].fullTime[indexM] === "-") {
            fixcolor.push("#162e58");
          } else if (
            fixtures[indexF].fullTime[indexM] !==
            userPredictions[indexF].fixturePrediction[indexM]
          ) {
            fixcolor.push("#ad0000");
          } else {
            fixcolor.push("green");
          }
        }
        coloring.push(fixcolor);
      }
      setColors(coloring);
      setLoading(false);
    }
  }, [fixtures, teams, userPredictions, getClubs]);

  return (
    <>
      {loading ? (
        <p>DATA LOADING, PLEASE WAIT...</p>
      ) : (
        <div className="predictions">
          <Switch setScoreSwitch={setScoreSwitch} />
          <Table
            fixtures={fixtures}
            teams={teams}
            scoreSwitch={scoreSwitch}
            colors={colors}
            userPredictions={userPredictions}
          />
        </div>
      )}
    </>
  );
}

function Switch({ setScoreSwitch }) {
  return (
    <div className="switch">
      <button
        className="button-34"
        onClick={() => {
          setScoreSwitch(true);
        }}
      >
        YOUR PREDICTION
      </button>
      <button
        className="button-34"
        onClick={() => {
          setScoreSwitch(false);
        }}
      >
        FULL-TIME
      </button>
    </div>
  );
}

function Table({ fixtures, teams, scoreSwitch, colors, userPredictions }) {
  return (
    <section className="pre-table">
      {fixtures.map((fixture, indexF) => {
        return (
          <div className="round" key={fixture.number}>
            {fixture.matches.map((match, indexM) => {
              return (
                <Match key={match.numM}>
                  <Team
                    ground={"home"}
                    letter={"H"}
                    teams={teams}
                    match={match}
                  />
                  {scoreSwitch ? (
                    <Prediction
                      colors={colors}
                      indexF={indexF}
                      indexM={indexM}
                      userPredictions={userPredictions}
                    />
                  ) : (
                    <Fulltime fixture={fixture} indexM={indexM} />
                  )}
                  <Team
                    ground={"away"}
                    letter={"A"}
                    teams={teams}
                    match={match}
                  />
                </Match>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

function Team({ ground, letter, teams, match }) {
  return (
    <>
      {teams.map((team) => {
        if (team.shortname === match[`${ground}`]) {
          return (
            <div className={letter} key={1}>
              <img src={team.image} alt={team.name} />
            </div>
          );
        } else {
          return null;
        }
      })}
    </>
  );
}

function Fulltime({ fixture, indexM }) {
  return (
    <p
      className="result"
      style={{
        backgroundColor: `#d45900`,
      }}
    >
      {fixture.fullTime[indexM]}
    </p>
  );
}

function Prediction({ colors, indexF, indexM, userPredictions }) {
  return (
    <p
      className="result"
      style={{
        backgroundColor: `${colors[indexF][indexM]}`,
      }}
    >
      {userPredictions[indexF].fixturePrediction[indexM]}
    </p>
  );
}

function Match({ children }) {
  return <div className="match">{children}</div>;
}
