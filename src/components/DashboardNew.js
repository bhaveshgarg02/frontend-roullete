import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/kaiadmin.min.css";
import "../assets/css/fonts.css";
import "./index.css";

// Import API functions
import { fetchUsers } from "../services/userService";
import { fetchAgents } from "../services/agentService";
import { fetchAllGames } from "../services/gameService";
import { fetchAllTransactionHistory } from "../services/transactionService";
import { fetchWithdrawals } from "../services/withdrawalService";
import { fetchLiveGame, manualapiWinningNumber } from "../services/gameService"; // Updated import
import { fetchGameStatus, toggleGameStatus } from "../services/cronService";
const moment = require("moment-timezone");
const socket = io("https://api.fungaming.in");

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [games, setGames] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalData, setWithdrawalData] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // State for sidebar collapse
  const [liveGame, setLiveGame] = useState(null);
  const [stakes, setStakes] = useState([]);
  const [manualWinningNumber, setManualWinningNumber] = useState("");
  const [fetchStatusMessage, setFetchStatusMessage] = useState(
    "Fetching live game data..."
  );
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [winningNumberMessage, setWinningNumberMessage] = useState("");
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [cronStatusMessage, setCronStatusMessage] = useState("");

  useEffect(() => {
    // Function to fetch data for users, agents, games, transactions, etc.
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersData = await fetchUsers();
        const agentsData = await fetchAgents();
        const gamesData = await fetchAllGames({ date: "", page: 1 });
        const transactions = await fetchAllTransactionHistory();
        const withdrawals = await fetchWithdrawals();

        setUsers(usersData);
        setAgents(agentsData);
        setGames(gamesData);
        setTransactionHistory(transactions);
        setWithdrawalData(withdrawals);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (!liveGame) {
      // Fetch data only if there's no live game
      fetchData();
    }

    // Fetch live game data
    const getLiveGame = async () => {
      try {
        const data = await fetchLiveGame();
        if (data && data.game) {
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

  // Handle manual setting of winning number
  const handleSetWinningNumber = async () => {
    if (!manualWinningNumber || isNaN(manualWinningNumber)) {
      setFetchStatusMessage("Please enter a valid winning number.");
      return;
    }
    try {
      await manualapiWinningNumber(liveGame.gameNumber, manualWinningNumber);
      setWinningNumberMessage(
        `Winning number for Game ${liveGame.gameNumber} has been set to ${manualWinningNumber}.`
      );
      setManualWinningNumber("");
    } catch (error) {
      console.error("Error setting the winning number:", error);
      setFetchStatusMessage("Failed to set the winning number.");
    }
  };

  // Handle toggling cron job (game creation status)
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

  // Fetch cron status
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

  const userCount = users.length;
  const agentCount = agents.length;
  const gameCount = games.totalGames;

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
        data-background-color="dark"
      >
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="logo-header" data-background-color="dark">
            <div className="white">Roulette Game</div>
          </div>
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
              <li className="nav-item active">
                <Link to="/admin-dashboard" className="collapsed">
                  <i className="fa fa-home"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
              {/* Dashboard Links */}
              <li className="nav-item">
                <Link to="/users">
                  <i className="fa fa-users"></i>
                  <p>Manage Users</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agents">
                  <i className="fa fa-user-secret" aria-hidden="true"></i>
                  <p>Manage Agents</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/fund-requests">
                  <i className="fa fa-pen-square"></i>
                  <p>Buy Coin Requests</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/live-game">
                  <i className="fa fa-gamepad" aria-hidden="true"></i>
                  <p>Live Game</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notices">
                  <i className="fa fa-sticky-note" aria-hidden="true"></i>
                  <p>Manage Notices</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/all-games">
                  <i className="fa fa-history" aria-hidden="true"></i>
                  <p>Game History</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/user-stakes">
                  <i className="fa fa-users" aria-hidden="true"></i>
                  <p>Real Time Stakes For Players</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/transaction-history">
                  <i className="fa fa-receipt"></i>
                  <p>Transaction History</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/withdrawls">
                  <i className="fa fa-wallet"></i>
                  <p>Withdrawal Coin Request</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i
            className={`fa ${isSidebarCollapsed ? "fa-bars" : "fa-times"}`}
          ></i>
        </button>
      </div>
      {/* End Sidebar */}

      {/* Main Panel */}
      <div className={`main-panel`}>
        <div className="container">
          <div className="page-inner">
            <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row ">
              <div>
                <h3 className="fw-bold mb-3">Dashboard</h3>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="row">
              {/* Manage Users Card */}
              <div className="col-sm-6 col-md-4">
                <div className="card card-stats card-round">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-icon">
                        <div className="icon-big text-center icon-primary bubble-shadow-small">
                          <i className="fa fa-users"></i>
                        </div>
                      </div>
                      <div className="col col-stats ms-3 ms-sm-0">
                        <div className="numbers">
                          <h4 className="card-title">Total Users</h4>
                          <p className="card-category">
                            {loading ? "Loading..." : userCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Agents Card */}
              <div className="col-sm-6 col-md-4">
                <div className="card card-stats card-round">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-icon">
                        <div className="icon-big text-center icon-info bubble-shadow-small">
                          <i className="fa fa-user-secret"></i>
                        </div>
                      </div>
                      <div className="col col-stats ms-3 ms-sm-0">
                        <div className="numbers">
                          <h4 className="card-title">Total Agents</h4>
                          <p className="card-category">
                            {loading ? "Loading..." : agentCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Count Card */}
              <div className="col-sm-6 col-md-4">
                <div className="card card-stats card-round">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-icon">
                        <div className="icon-big text-center icon-danger bubble-shadow-small">
                          <i className="fa fa-history" aria-hidden="true"></i>
                        </div>
                      </div>
                      <div className="col col-stats ms-3 ms-sm-0">
                        <div className="numbers">
                          <h4 className="card-title">Total Games</h4>
                          <p className="card-category">
                            {loading ? "Loading..." : gameCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cron Status */}
            <div className="row">
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <h5>Game Creation Cron Status</h5>
                    <p>{cronStatusMessage}</p>
                    <button
                      className="btn btn-primary"
                      onClick={handleCronToggle}
                    >
                      {isCronRunning ? "Stop Cron Job" : "Start Cron Job"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Data */}
            <div className="row">
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <h5>{fetchStatusMessage}</h5>
                    <p>{gameStatusMessage}</p>
                    <p>{winningNumberMessage}</p>
                    {/* Manual Winning Number */}
                    {liveGame && (
                      <div>
                        <input
                          type="number"
                          value={manualWinningNumber}
                          onChange={(e) =>
                            setManualWinningNumber(e.target.value)
                          }
                        />
                        <button onClick={handleSetWinningNumber}>
                          Set Winning Number
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Main Panel */}
    </div>
  );
};

export default Dashboard;
