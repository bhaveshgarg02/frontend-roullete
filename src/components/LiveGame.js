import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  fetchLiveGame,
  manualapiWinningNumber,
  setgamemultiplier,
} from "../services/gameService"; // Import service functions
import { fetchGameStatus, toggleGameStatus } from "../services/cronService";
import io from "socket.io-client";

const socket = io("https://api.fungaming.in"); // Replace with your server URL

const LiveGame = () => {
  const [liveGame, setLiveGame] = useState(null);
  const [stakes, setStakes] = useState([]);
  const [fetchStatusMessage, setFetchStatusMessage] = useState(
    "Fetching live game data..."
  );
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [winningNumberMessage, setWinningNumberMessage] = useState("");
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [cronStatusMessage, setCronStatusMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBidDetails, setSelectedBidDetails] = useState([]);
  const [gameMultiplier, setGameMultiplier] = useState(null);
  const [newMultiplier, setNewMultiplier] = useState(null);

  const handleNumberClick = (number) => {
    const filteredBids = stakes.filter((stake) => stake.number === number);
    setSelectedBidDetails(filteredBids);
    setSelectedNumber(number); // Persist selection
    setShowPopup(true);
  };

  const handleSetWinningNumber = async () => {
    try {
      await manualapiWinningNumber(liveGame.gameNumber, selectedNumber);
      setShowPopup(false);
    } catch (error) {
      console.error("Error setting the winning number:", error);
      setFetchStatusMessage("Failed to set the winning number.");
    }
  };

  const closePopup = async () => {
    setShowPopup(false);
    setSelectedNumber(null);
  };
  const handleSetMultiplier = async () => {
    if (!newMultiplier || isNaN(newMultiplier)) {
      alert("Please enter a valid multiplier");
      return;
    }
    try {
      await setgamemultiplier(liveGame.gameNumber, newMultiplier);
      setGameMultiplier(newMultiplier);
      alert("Multiplier updated successfully!");
      setNewMultiplier("");
    } catch (error) {
      console.error("Error setting the game multiplier:", error);
      alert("Failed to update multiplier.");
    }
  };

  useEffect(() => {
    const getLiveGame = async () => {
      try {
        const data = await fetchLiveGame();
        if (data && data.game && data.message === "Live Game") {
          setLiveGame({
            gameNumber: data.game.gameNumber,
            status: data.game.status,
            createdAt: data.game.createdAt,
            winningNumber: data.game.winningNumber,
            gameMultiplier: data.game.gameMultiplier,
          });
          setStakes(data.game.stakes || []);
          setGameMultiplier(data.game.gameMultiplier); // Set initial game multiplier

          // Set the winning number message if it is not null
          if (data.game.winningNumber) {
            setWinningNumberMessage(
              `Winning Number: ${data.game.winningNumber}`
            );
          } else {
            setWinningNumberMessage(""); // Reset if there's no winning number
          }

          setFetchStatusMessage("Live game data loaded successfully.");
        } else {
          setLiveGame(null);
          setFetchStatusMessage("No live game in progress.");
          setGameStatusMessage("No game currently active.");
        }
      } catch (error) {
        console.error("Error fetching live game:", error);
        setFetchStatusMessage("No live game is in progress.");
      }
    };

    getLiveGame();

    // Socket listeners for real-time updates
    socket.on("live-game", (gameData) => {
      setLiveGame(gameData);
      if (gameData.status === "started") {
        setGameStatusMessage("A new game has started!");
        setWinningNumberMessage("");
        // Clear winning number when a new game starts
      } else if (gameData.status === "bidding-closed") {
        setGameStatusMessage("Bidding is closed for the current game.");
      } else if (gameData.status === "ended") {
        setGameStatusMessage(`Game ${gameData.gameNumber} has ended.`);
        setStakes([]);
        // Reset winning number when game ends
        setWinningNumberMessage("");
      }

      // Set the winning number message if available
      if (gameData.winningNumber) {
        setWinningNumberMessage(`Winning Number: ${gameData.winningNumber}`);
      }
    });

    socket.on("game-update", ({ gameNumber, stakes }) => {
      if (liveGame && gameNumber === liveGame.gameNumber) {
        setStakes(stakes);
      }
    });

    socket.on("game-result", ({ gameNumber, winningNumber }) => {
      if (liveGame && gameNumber === liveGame.gameNumber) {
        setWinningNumberMessage(`Winning Number: ${winningNumber}`);
        setWinningNumberMessage("");
        setSelectedNumber(null);
      }
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("live-game");
      socket.off("game-update");
      socket.off("game-result");
    };
  }, [liveGame]);

  useEffect(() => {
    const getLiveGame = async () => {
      try {
        const data = await fetchLiveGame();
        if (data && data.game && data.message === "Live Game") {
          setLiveGame({
            gameNumber: data.game.gameNumber,
            status: data.game.status,
            createdAt: data.game.createdAt,
            winningNumber: data.game.winningNumber,
          });
          setStakes(data.game.stakes || []);

          // Set the winning number message if it is not null
          if (data.game.winningNumber) {
            setWinningNumberMessage(
              `Winning Number: ${data.game.winningNumber}`
            );
            setSelectedNumber(data.game.winningNumber);
          } else {
            setWinningNumberMessage(""); // Reset if there's no winning number
          }

          setFetchStatusMessage("Live game data loaded successfully.");
        } else {
          setLiveGame(null);
          setFetchStatusMessage("No live game in progress.");
          setGameStatusMessage("No game currently active.");
        }
      } catch (error) {
        console.error("Error fetching live game:", error);
        setFetchStatusMessage("No live game is in progress.");
      }
    };

    getLiveGame();

    // Socket listeners for real-time updates
    socket.on("live-game", (gameData) => {
      setLiveGame(gameData);
      if (gameData.status === "started") {
        setGameStatusMessage("A new game has started!");
        setWinningNumberMessage("");
        // Clear winning number when a new game starts
      } else if (gameData.status === "bidding-closed") {
        setGameStatusMessage("Bidding is closed for the current game.");
      } else if (gameData.status === "ended") {
        setGameStatusMessage(`Game ${gameData.gameNumber} has ended.`);
        setStakes([]);
        // Reset winning number when game ends
        setWinningNumberMessage("");
      }

      // Set the winning number message if available
      if (gameData.winningNumber) {
        setWinningNumberMessage(`Winning Number: ${gameData.winningNumber}`);
        setSelectedNumber(gameData.winningNumber);
      }
    });

    // Cleanup socket listeners on unmount
  }, []); // Dependency on liveGame to track changes to it

  useEffect(() => {
    const calculateRemainingTime = () => {
      if (liveGame) {
        const gameStartTime = new Date(liveGame.createdAt).getTime();
        const currentTime = new Date().getTime();
        const totalGameDuration = 90 * 1000; // 1 min 30 sec in milliseconds
        const elapsedTime = currentTime - gameStartTime;
        const remainingTime = totalGameDuration - elapsedTime;
        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          setTimeLeft(0);
        }
      }
    };

    calculateRemainingTime();

    const timerInterval = setInterval(() => {
      calculateRemainingTime();
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [liveGame]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // const handleSetWinningNumber = async () => {
  //   if (!manualWinningNumber || isNaN(manualWinningNumber)) {
  //     setFetchStatusMessage("Please enter a valid winning number.");
  //     return;
  //   }
  //   try {
  //     await manualapiWinningNumber(liveGame.gameNumber, manualWinningNumber);
  //     setWinningNumberMessage(
  //       `Winning number for Game ${liveGame.gameNumber} has been set to ${manualWinningNumber}.`
  //     );
  //     setManualWinningNumber("");
  //   } catch (error) {
  //     console.error("Error setting the winning number:", error);
  //     setFetchStatusMessage("Failed to set the winning number.");
  //   }
  // };

  const handleCronToggle = async () => {
    try {
      const newStatus = !isCronRunning;
      await toggleGameStatus(newStatus);
      setIsCronRunning(newStatus);
      setCronStatusMessage(
        newStatus
          ? "Game creation has been started successfully. A new game will be created shortly."
          : "Game creation has been stopped successfully."
      );
    } catch (error) {
      console.error("Error toggling the cron job:", error);
      setCronStatusMessage("Error toggling the game creation status.");
    }
  };

  // Fetch the current status of the cron job on load
  useEffect(() => {
    const getGameStatus = async () => {
      try {
        const data = await fetchGameStatus();
        setIsCronRunning(data.isCronRunning);
        setCronStatusMessage(
          data.isCronRunning
            ? "Game creation is currently started."
            : "Game creation is currently stopped."
        );
      } catch (error) {
        console.error("Error fetching game status:", error);
        setCronStatusMessage("Error fetching game creation status.");
      }
    };

    getGameStatus();
  }, []);

  return (
    <Layout>
      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}
        >
          Live Game
        </h1>

        {/* Messages Section */}
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            background: "#E7EAEE",
          }}
        >
          <p>
            <strong>Live Game Update:</strong> {fetchStatusMessage}
          </p>
          <p>
            <strong>Cron Status:</strong> {cronStatusMessage}
          </p>
          {gameStatusMessage && (
            <p>
              <strong>Game Status:</strong> {gameStatusMessage}
            </p>
          )}

          {winningNumberMessage && (
            <p style={{ color: "#28a745", fontWeight: "bold" }}>
              {winningNumberMessage}
            </p>
          )}
        </div>

        {/* Live Game Info */}
        {liveGame ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              background: "#f1f1f1",
            }}
          >
            <p>
              <strong>Game Number:</strong> {liveGame.gameNumber}
            </p>
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                background: "#f9f9f9",
              }}
            >
              <p>
                <strong>Game Multiplier:</strong> {gameMultiplier || "Not Set"}
              </p>

              <input
                type="number"
                value={newMultiplier}
                onChange={(e) => setNewMultiplier(e.target.value)}
                placeholder="Enter new multiplier"
                style={{
                  padding: "8px",
                  marginRight: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />

              <button
                onClick={handleSetMultiplier}
                style={{
                  padding: "8px 12px",
                  background: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Set Game Multiplier
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff6347",
                marginBottom: "20px",
              }}
            >
              Time Left: {formatTime(timeLeft)}
            </div>
            <div>
              <h2>Bids</h2>
              <table
                border="1"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr style={{ background: "#ddd" }}>
                    <th style={{ width: "150px" }}>Bid Number</th>
                    {Array.from({ length: 10 })
                      .map((_, i) => {
                        const bid = stakes.find((stake) => stake.number === i);
                        return {
                          number: i,
                          totalStake: bid ? bid.totalStake : 0,
                        };
                      })
                      .sort((a, b) => b.totalStake - a.totalStake) // Sorting by highest stake first
                      .map(({ number }) => (
                        <th key={number}>{number}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Stakes</td>
                    {Array.from({ length: 10 })
                      .map((_, i) => {
                        const bid = stakes.find((stake) => stake.number === i);
                        return {
                          number: i,
                          totalStake: bid ? bid.totalStake : 0,
                        };
                      })
                      .sort((a, b) => b.totalStake - a.totalStake)
                      .map(({ number, totalStake }) => (
                        <td
                          key={number}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              selectedNumber === number ? "#4CAF50" : "#fff",
                            color: "#000",
                            padding: "10px",
                          }}
                          onClick={() => handleNumberClick(number)}
                        >
                          {totalStake}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* {liveGame ? (
          <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "#ff6347", marginBottom: "20px" }}>
            Time Left: {formatTime(timeLeft)}
          </div>
        ) : null} */}

        {/* Stakes Section */}
        {/* Stakes Section */}

        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3>Bids for Number {selectedNumber}</h3>
            <table
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBidDetails.flatMap((stake) =>
                  stake.users.map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.userId}</td>
                      <td>{user.name}</td>
                      <td>{user.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button
              onClick={handleSetWinningNumber}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Set {selectedNumber} as Winning Number
            </button>
            <button
              onClick={closePopup}
              style={{
                marginLeft: "10px",
                padding: "8px 12px",
                background: "#FF6347",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
        {/* Cron Toggle Button */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleCronToggle}
            style={{
              background: isCronRunning ? "#FF6347" : "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            {isCronRunning ? "Stop Game Creation" : "Start Game Creation"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default LiveGame;
