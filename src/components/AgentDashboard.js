import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import "./index.css"; // Import your custom CSS if not global
import { fetchAgentTransactionHistory } from "../services/transactionService";
import { fetchWithdrawals } from "../services/withdrawalService";
import { fetchLiveGame } from "../services/gameService"; // Import your service function
import { getAgentNotices } from "../services/loginAgent";

const AgentsDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [liveGame, setLiveGame] = useState(null);
  const [gameStatusMessage, setGameStatusMessage] = useState("");
  const [winningNumberMessage, setWinningNumberMessage] = useState("");
  const [stakes, setStakes] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [notice, setNotice] = useState(""); // State for notice message
  const [showNotice, setShowNotice] = useState(false);
  const moment = require("moment-timezone");
  const socketUrl = "https://api.fungaming.in";

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    sessionStorage.removeItem("token"); // If stored in sessionStorage
  };

  useEffect(() => {
    const fetchData = async () => {
      const agentData = JSON.parse(localStorage.getItem("user"));
      if (!agentData || !agentData.id) return;

      const agentId = agentData.id;

      try {
        // Fetch recent transactions
        const transactionHistoryData = await fetchAgentTransactionHistory(
          agentId
        );
        setTransactionHistory(transactionHistoryData);
        setLoadingTransactions(false);
        // Fetch recent withdrawals
        const fetchedWithdrawals = await fetchWithdrawals({ agentId });
        setWithdrawals(fetchedWithdrawals);
        setLoadingWithdrawals(false);

        const agentNoticeData = await getAgentNotices(agentId); // Fetch notice using the service
        if (agentNoticeData?.notice) {
          setNotice(agentNoticeData.notice); // Set notice state
          setShowNotice(true); // Display the notice

          // Hide the notice after 15 seconds
          setTimeout(() => {
            setShowNotice(false); // Hide the notice
          }, 15000); // 15 seconds (15000 ms)
        }

        // Fetch the live game data
        const liveGameData = await fetchLiveGame(); // Fetch live game using the service
        setLiveGame(liveGameData); // Set live game data
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingTransactions(false);
        setLoadingWithdrawals(false);
      }
    };
    if (!liveGame) {
      // Fetch data only if there's no live game
      fetchData();
    }

    const socket = io(socketUrl);
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
          if (data.game.winningNumber) {
            setWinningNumberMessage(
              `Winning Number: ${data.game.winningNumber}`
            );
          } else {
            setWinningNumberMessage(""); // Reset if there's no winning number
          }
          setGameStatusMessage("Live game data loaded successfully.");
        } else {
          setLiveGame(null);
          setGameStatusMessage("No game currently active.");
        }
      } catch (error) {
        setGameStatusMessage("No live game in progress");
      }
    };

    getLiveGame();
    // Listen for live game updates
    socket.on("live-game", (gameData) => {
      setLiveGame(gameData);
      if (gameData.status === "started") {
        setGameStatusMessage("A new game has started!");
        setWinningNumberMessage("");
      } else if (gameData.status === "bidding-closed") {
        setGameStatusMessage("Bidding is closed for the current game.");
      } else if (gameData.status === "ended") {
        setGameStatusMessage(`Game ${gameData.gameNumber} has ended.`);
        setStakes([]); // Reset stakes when the game ends
      }
    });

    // Listen for game updates to update the stakes
    socket.on("game-update", ({ gameNumber, stakes }) => {
      if (liveGame && gameNumber === liveGame.gameNumber) {
        setStakes(stakes);
      }
    });

    // Listen for the game result and set the winning number
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
  }, [liveGame]); // Dependency on liveGame to ensure listeners are set correctly

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
                <Link to="/agent-dashboard" className="collapsed">
                  <i className="fa fa-home"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-live-game">
                  <i className="fa fa-gamepad" aria-hidden="true"></i>
                  <p>Live Game</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-transaction-history">
                  <i className="fa fa-receipt"></i>
                  <p>Transaction History</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-request-funds">
                  <i className="fa fa-credit-card"></i>
                  <p>Request Funds from Admin</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-transfer-funds">
                  <i className="fa fa-exchange-alt"></i>
                  <p>Transfer Funds to Player</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-game-history">
                  <i className="fa fa-history"></i>
                  <p>Game History</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-withdrawls">
                  <i className="fa fa-wallet"></i>
                  <p>Request Withdrawals & History</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/agent-withdrawl-approve">
                  <i className="fa fa-check-circle"></i>
                  <p>Approve Withdrawals for Users</p>
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
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i
            className={`fa ${isSidebarCollapsed ? "fa-bars" : "fa-times"}`}
          ></i>
        </button>
      </div>
      {/* End Sidebar */}

      {/* Main Panel */}
      <div className={`${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
                <div>
                  <h3 className="fw-bold mb-3">Agent Dashboard</h3>
                </div>
              </div>
              {showNotice && (
                <div className="notice-container">
                  <div className="notice-message show">{notice}</div>
                </div>
              )}
              {/* Live Game Section */}
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Live Game</h4>
                    </div>
                    <div className="card-body">
                      {/* Display Game Number */}
                      {liveGame?.gameNumber && (
                        <h5>Game Number: {liveGame.gameNumber}</h5>
                      )}

                      {/* Display Game Status Message */}
                      {gameStatusMessage && <p>{gameStatusMessage}</p>}

                      {/* Display Winning Number Message */}
                      {winningNumberMessage && (
                        <p style={{ color: "#28a745", fontWeight: "bold" }}>
                          {winningNumberMessage}
                        </p>
                      )}

                      {/* Display Stakes if Available */}
                      {stakes?.length > 0 ? (
                        <div>
                          <h5>Current Stakes:</h5>
                          <ul>
                            {stakes.map((stake) => (
                              <li key={stake._id}>
                                <strong>Number {stake.number}</strong> (Total
                                Stake: {stake.totalStake})
                                <ul>
                                  {stake.users.map((user) => (
                                    <li key={user._id}>
                                      {user.name}:{" "}
                                      <strong>{user.amount}</strong>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>No stakes placed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Recent Transactions</h4>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingTransactions ? (
                            <tr>
                              <td colSpan="4">Loading...</td>
                            </tr>
                          ) : (
                            transactionHistory
                              .sort(
                                (a, b) =>
                                  new Date(b.transactionDate) -
                                  new Date(a.transactionDate)
                              )
                              .slice(0, 3)
                              .map((transaction) => (
                                <tr key={transaction.transactionId}>
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
                      {/* View More Button */}
                      <div className="d-flex justify-content-end">
                        <Link
                          to="/agent-transaction-history"
                          className="btn btn-primary"
                        >
                          View More
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="card-title">Recent Withdrawals</h4>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingWithdrawals ? (
                            <tr>
                              <td colSpan="3">Loading...</td>
                            </tr>
                          ) : (
                            withdrawals
                              .filter(
                                (withdrawal) =>
                                  withdrawal.requestType === "agent"
                              ) // Filter withdrawals for agent requestType
                              .sort(
                                (a, b) =>
                                  new Date(b.requestDate) -
                                  new Date(a.requestDate)
                              ) // Sort by requestDate in descending order
                              .slice(0, 5) // Limit to 5 entries
                              .map((withdrawal) => (
                                <tr key={withdrawal.id}>
                                  <td>{withdrawal.amount}</td>
                                  <td>{withdrawal.status}</td>
                                  <td>
                                    {moment(withdrawal.requestDate)
                                      .tz("Asia/Kolkata")
                                      .format("YYYY-MM-DD HH:mm:ss")}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                      {/* View More Button */}
                      <div className="d-flex justify-content-end">
                        <Link
                          to="/agent-withdrawls"
                          className="btn btn-primary"
                        >
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
      {/* End Main Panel */}
    </div>
  );
};

export default AgentsDashboard;
