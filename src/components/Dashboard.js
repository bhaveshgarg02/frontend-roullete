import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
import {
  fetchUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/loginAdmin";
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
  const [manualWinningNumber, setManualWinningNumber] = useState("");
  const [fetchStatusMessage, setFetchStatusMessage] = useState(
    "Fetching live game data..."
  );
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [winningNumberMessage, setWinningNumberMessage] = useState("");
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [cronStatusMessage, setCronStatusMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

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
        if (data && data.game && data.message === "Live Game") {
          setLiveGame({
            gameNumber: data.game.gameNumber,
            status: data.game.status,
            createdAt: data.game.createdAt,
            winningNumber: data.game.winningNumber,
          });
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
      } else if (gameData.status === "bidding-closed") {
        setGameStatusMessage("Bidding is closed for the current game.");
      } else if (gameData.status === "ended") {
        setGameStatusMessage(`Game ${gameData.gameNumber} has ended.`);
      }
    });

    socket.on("game-update", ({ gameNumber, stakes }) => {
      if (liveGame && gameNumber === liveGame.gameNumber) {
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

  const loadNotifications = async () => {
    try {
      const unreadNotifications = await fetchUnreadNotifications();

      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Mark a notification as read

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  const handleRemoveNotification = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === "Buy Coin Request") {
      navigate("/fund-requests");
    } else if (notif.type === "Withdrawal Coin Request") {
      navigate("/withdrawls");
    }
    setShowNotifications(false); // Close popup after navigation
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    sessionStorage.removeItem("token"); 
      navigate("/"); // If stored in sessionStorage
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
              <li className="nav-item">
                <Link to="/admin-profile" className="collapsed">
                  <i className="fa fa-user"></i>
                  <p>View Profile</p>
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
                <Link to="/fund-requests" style={{ color: "green" }}>
                  <i
                    className="fa fa-pen-square"
                    style={{ color: "green" }}
                  ></i>
                  <p style={{ color: "green" }}>Buy Coin Requests</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/withdrawls" style={{ color: "green" }}>
                  <i className="fa fa-wallet" style={{ color: "green" }}></i>
                  <p style={{ color: "green" }}>Withdrawal Coin Request</p>
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

              <li className="nav-item logout-item" onClick={handleLogout}>
                <Link to="/">
                  <i className="fa fa-sign-out-alt"></i>
                  <p>Logout</p>
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
      <div className="header">
        <div className="header-right">
          {/* Notification Icon */}
          <div
            className="notification-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fa fa-bell"></i>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {/* Notification Popup */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              <ul className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className={`notification-item ${
                        notif.isRead ? "" : "unread"
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification-content">
                        <span
                          className={`notif-type ${notif.type
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                        >
                          {notif.type}
                        </span>
                        <p>{notif.message}</p>
                      </div>
                      <button
                        className="close-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigating when clicking ❌
                          handleRemoveNotification(notif._id);
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </ul>
            </div>
          )}

          {/* Profile Section */}
          <NavLink to="/admin-profile" className="profile-section">
            <img
              src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
              alt="Profile"
              className="profile-image"
            />
            <span>Super Admin</span>
          </NavLink>

          {/* Logout Icon */}
          <div
            className="logout-icon"
            onClick={handleLogout}
            title="Logout"
          >
            <i className="fa fa-sign-out-alt"></i>
          </div>
        </div>
      </div>
      {/* Main Panel */}
      <div className={` ${isSidebarCollapsed ? "collapsed" : ""}`}>
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
                            <i className="fa fa-user-check"></i>
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

                {/* Game History Card */}
                <div className="col-sm-6 col-md-4">
                  <div className="card card-stats card-round">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-icon">
                          <div className="icon-big text-center icon-success bubble-shadow-small">
                            <i className="fa fa-history"></i>
                          </div>
                        </div>
                        <div className="col col-stats ms-3 ms-sm-0">
                          <div className="numbers">
                            <h4 className="card-title">Total Games Played</h4>
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
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Live Game</h4>
                    </div>
                    <div className="card-body">
                      <p>{fetchStatusMessage}</p>
                      {gameStatusMessage && <p>{gameStatusMessage}</p>}
                      {winningNumberMessage && (
                        <p style={{ color: "#28a745", fontWeight: "bold" }}>
                          {winningNumberMessage}
                        </p>
                      )}
                      {liveGame && (
                        <>
                          <p>
                            <strong>Game Number:</strong> {liveGame.gameNumber}
                          </p>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#ff6347",
                              marginBottom: "20px",
                              marginTop: "-10px",
                            }}
                          >
                            Time Left: {formatTime(timeLeft)}
                          </div>
                          <h5>Set Winning Number</h5>
                          <div style={{ marginTop: "10px" }}>
                            <input
                              type="number"
                              value={manualWinningNumber}
                              onChange={(e) =>
                                setManualWinningNumber(e.target.value)
                              }
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
                                marginLeft: "10px",
                              }}
                            >
                              Set Winning Number
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cron Job Control */}

                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Game Creation Status</h4>
                    </div>
                    <div className="card-body">
                      <p>{cronStatusMessage}</p>
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
                        {isCronRunning
                          ? "Stop Game Creation"
                          : "Start Game Creation"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Fake Data Table and Graphs */}
              <div className="row">
                {/* Fake Table */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Recent Transactions</h4>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="4">Loading...</td>
                            </tr>
                          ) : (
                            transactionHistory
                              .slice(0, 3)
                              .map((transaction) => (
                                <tr key={transaction.transactionId}>
                                  <td>{transaction.userName}</td>
                                  <td>{transaction.transactionType}</td>
                                  <td>{transaction.description}</td>
                                  <td>
                                    {moment(transaction.transactionDate)
                                      .tz("Asia/Kolkata")
                                      .format("YYYY-MM-DD HH:mm:ss")}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                      {/* Add View More Button */}
                      <div className="d-flex justify-content-end">
                        <Link
                          to="/transaction-history"
                          className="btn btn-primary"
                        >
                          View More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fake Graph */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">Recent Withdrawals</div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                          <thead>
                            <tr>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Request Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  Loading...
                                </td>
                              </tr>
                            ) : withdrawalData.length > 0 ? (
                              withdrawalData
                                .sort(
                                  (a, b) =>
                                    new Date(b.requestDate) -
                                    new Date(a.requestDate)
                                ) // Sort by requestDate in descending order
                                .slice(0, 5)
                                .map((withdrawal) => (
                                  <tr key={withdrawal._id}>
                                    <td>{withdrawal.amount}</td>
                                    <td>{withdrawal.status}</td>
                                    <td>
                                      {moment(withdrawal.requestDate)
                                        .tz("Asia/Kolkata")
                                        .format("YYYY-MM-DD HH:mm:ss")}
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No withdrawals found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <div className="d-flex justify-content-end">
                          <Link to="/withdrawls" className="btn btn-primary">
                            View More
                          </Link>
                        </div>
                      </div>
                    </div>
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
