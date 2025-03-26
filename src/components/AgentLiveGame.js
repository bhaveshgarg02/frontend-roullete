import React, { useState, useEffect } from "react";
import { fetchLiveGame } from "../services/gameService"; // Import service functions
import { fetchGameStatus } from "../services/cronService";
import io from "socket.io-client";
import LayoutAgent from "./LayoutAgent";
const socket = io("https://api.fungaming.in"); // Replace with your server URL

const LiveGame = () => {
  const [liveGame, setLiveGame] = useState(null);
  const [stakes, setStakes] = useState([]);
  const [fetchStatusMessage, setFetchStatusMessage] = useState(
    "Fetching live game data..."
  );
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [winningNumberMessage, setWinningNumberMessage] = useState("");

  useEffect(() => {
    const getLiveGame = async () => {
      try {
        const data = await fetchLiveGame();
        if (data && data.game && data.message === "Live Game") {
          setLiveGame({
            gameNumber: data.game.gameNumber,
            status: data.game.status,
            createdAt: data.game.createdAt,
          });
          setStakes(data.game.stakes || []);

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
      } else if (gameData.status === "bidding-closed") {
        setGameStatusMessage("Bidding is closed for the current game.");
      } else if (gameData.status === "ended") {
        setGameStatusMessage(`Game ${gameData.gameNumber} has ended.`);
        setStakes([]);
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
      }
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("live-game");
      socket.off("game-update");
      socket.off("game-result");
    };
  }, [liveGame]);

  //   const handleSetWinningNumber = async () => {
  //     if (!manualWinningNumber || isNaN(manualWinningNumber)) {
  //       setFetchStatusMessage("Please enter a valid winning number.");
  //       return;
  //     }
  //     try {
  //       await manualapiWinningNumber(liveGame.gameNumber, manualWinningNumber);
  //       setWinningNumberMessage(
  //         `Winning number for Game ${liveGame.gameNumber} has been set to ${manualWinningNumber}.`
  //       );
  //       setManualWinningNumber("");
  //     } catch (error) {
  //       console.error("Error setting the winning number:", error);
  //       setFetchStatusMessage("Failed to set the winning number.");
  //     }
  //   };

  // Fetch the current status of the cron job on load
  useEffect(() => {
    const getGameStatus = async () => {
      try {
        await fetchGameStatus();
      } catch (error) {
        console.error("Error fetching game status:", error);
      }
    };

    getGameStatus();
  }, []);

  return (
    <LayoutAgent>
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
          {/* <p>
          <strong>Cron Status:</strong> {cronStatusMessage}
        </p> */}
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
            {/* <h3>Set Winning Number Manually</h3>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <input
              type="number"
              value={manualWinningNumber}
              onChange={(e) => setManualWinningNumber(e.target.value)}
              placeholder="Enter Winning Number"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                flex: "1",
              }}
            />
            <button
              onClick={handleSetWinningNumber}
              style={{
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Set Winning Number
            </button>
          </div> */}
          </div>
        ) : null}

        {/* Stakes Section */}
        {stakes.length > 0 ? (
          <div>
            <h2 style={{ textAlign: "center", color: "#444" }}>Bids</h2>
            <table
              border="1"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr style={{ background: "#ddd", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Player ID</th>
                  <th style={{ padding: "8px" }}>Player Name</th>
                  <th style={{ padding: "8px" }}>Bid Amount</th>
                  <th style={{ padding: "8px" }}>Total Stake</th>
                  <th style={{ padding: "8px" }}>Bid Number</th>
                </tr>
              </thead>
              <tbody>
                {stakes.map((stake, index) => (
                  <tr key={index} style={{ textAlign: "left" }}>
                    <td style={{ padding: "8px" }}>
                      {stake.users.map((user, idx) => (
                        <div key={idx}>{user.userId}</div>
                      ))}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {stake.users.map((user, idx) => (
                        <div key={idx}>{user.name}</div>
                      ))}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {stake.users.map((user, idx) => (
                        <div key={idx}>{user.amount}</div>
                      ))}
                    </td>
                    <td style={{ padding: "8px" }}>{stake.totalStake}</td>
                    <td style={{ padding: "8px" }}>{stake.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "#777",
              marginTop: "25px",
              fontSize: "16px",
            }}
          >
            No bids have been placed yet by any player.
          </p>
        )}

        {/* Cron Toggle Button */}
        {/* <div style={{ marginTop: "20px", textAlign: "center" }}>
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
      </div> */}
      </div>
    </LayoutAgent>
  );
};

export default LiveGame;
