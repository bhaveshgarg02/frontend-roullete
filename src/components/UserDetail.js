import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

import { useParams } from "react-router-dom";
import { fetchUserProfile } from "../services/transactionService";
const moment = require("moment-timezone");
const UserDetail = () => {
  const { userId } = useParams(); // Get the userId from the URL
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // To manage active tab
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [gamesPage, setGamesPage] = useState(1);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchUserProfile(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    loadUserData();
  }, [userId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Switch tabs
  };

  const handlePagination = (page, type) => {
    if (type === "transactions") {
      setTransactionsPage(page);
    } else if (type === "withdrawals") {
      setWithdrawalsPage(page);
    } else if (type === "games") {
      setGamesPage(page);
    }
  };

  const paginateData = (data, page) => {
    const start = (page - 1) * 10;
    const end = page * 10;
    return data.slice(start, end);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / 10);
  };

  if (!user) {
    return <div>Loading player data...</div>;
  }

  return (
    <Layout>
      <div className="user-detail-container">
        <h2>{user.username}'s Details</h2>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => handleTabChange("profile")}
          >
            Player Profile
          </button>
          <button
            className={activeTab === "transactions" ? "active" : ""}
            onClick={() => handleTabChange("transactions")}
          >
            Transaction History
          </button>
          <button
            className={activeTab === "withdrawals" ? "active" : ""}
            onClick={() => handleTabChange("withdrawals")}
          >
            Withdrawal History
          </button>
          <button
            className={activeTab === "games" ? "active" : ""}
            onClick={() => handleTabChange("games")}
          >
            Game History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h3>Player Profile</h3>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>Player Name:</strong>
                    </td>
                    <td>{user.username}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Mobile:</strong>
                    </td>
                    <td>{user.mobile}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Wallet Balance:</strong>
                    </td>
                    <td>{user.wallet}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Banking Info:</strong>
                    </td>
                    <td>
                      {user.upiId
                        ? user.upiId
                        : user.bankingInfo?.accountNumber &&
                          user.bankingInfo?.ifscCode
                        ? `A/C No: ${user.bankingInfo.accountNumber} - IFSC CODE : ${user.bankingInfo.ifscCode}`
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Player Active Since:</strong>
                    </td>
                    <td>{moment(user.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === "transactions" && (
            <div>
              <h3>Transaction History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Game Number</th>
                    <th>Number</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginateData(
                    user.transactionHistory.sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    ),
                    transactionsPage
                  ).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.gameNumber || ""}</td>
                      <td>{transaction.number || ""}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.status}</td>
                      <td>{moment(transaction.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div>
                <button
                  onClick={() =>
                    handlePagination(transactionsPage - 1, "transactions")
                  }
                  disabled={transactionsPage === 1}
                >
                  Previous
                </button>
                <span>
                  {" "}
                  Page {transactionsPage} of{" "}
                  {getTotalPages(user.transactionHistory)}{" "}
                </span>
                <button
                  onClick={() =>
                    handlePagination(transactionsPage + 1, "transactions")
                  }
                  disabled={
                    user.transactionHistory.length <= transactionsPage * 10
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Withdrawal History Tab */}
          {activeTab === "withdrawals" && (
            <div>
              <h3>Withdrawal History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Request Date</th>
                    <th>Processed Date</th>
                    <th>Processed By</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginateData(
                    user.withdrawalHistory.sort(
                      (a, b) =>
                        new Date(b.requestDate) - new Date(a.requestDate)
                    ),
                    withdrawalsPage
                  ).map((withdrawal) => (
                    <tr key={withdrawal._id}>
                      <td>{withdrawal.amount}</td>
                      <td>{withdrawal.status}</td>
                      <td>
                      <td>{moment(withdrawal.requestDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                      </td>
                      <td>
  {withdrawal.processedDate
    ? moment(withdrawal.processedDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    : 'Pending'}
</td>

                      <td>
                        {withdrawal.status === "approved"
                          ? withdrawal.requestType === "user"
                            ? "Admin"
                            : "Agent"
                          : ""}
                      </td>
                      <td>{withdrawal.transactionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div>
                <button
                  onClick={() =>
                    handlePagination(withdrawalsPage - 1, "withdrawals")
                  }
                  disabled={withdrawalsPage === 1}
                >
                  Previous
                </button>
                <span>
                  {" "}
                  Page {withdrawalsPage} of{" "}
                  {getTotalPages(user.withdrawalHistory)}{" "}
                </span>
                <button
                  onClick={() =>
                    handlePagination(withdrawalsPage + 1, "withdrawals")
                  }
                  disabled={
                    user.withdrawalHistory.length <= withdrawalsPage * 10
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Game History Tab */}
          {activeTab === "games" && (
            <div>
              <h3>Game History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Game Number</th>
                    <th>Date</th>
                    {[...Array(10).keys()].map((number) => (
                      <th key={number}>{number}</th>
                    ))}
                    <th>System Winning Number</th>
                    <th>Winning Number by Admin</th>
                    <th>Winning Number</th>
                  </tr>
                </thead>
                <tbody>
                  {paginateData(
                    user.gameHistory.sort(
                      (a, b) => new Date(b.date) - new Date(a.date)
                    ),
                    gamesPage
                  ).map((game) => (
                    <tr key={game.gameNumber}>
                      <td>{game.gameNumber}</td>
                      <td>{moment(game.date).format("YYYY-MM-DD HH:mm:ss")}</td>
                      {[...Array(10).keys()].map((number) => {
                        const stakeForNumber = game.stakes.find(
                          (stake) => stake.number === number
                        );
                        const testUser1Stake = stakeForNumber?.users.find(
                          (user) => user.userId === userId
                        );
                        return (
                          <td key={number}>
                            {testUser1Stake ? `${testUser1Stake.amount}` : ""}
                          </td>
                        );
                      })}
                      <td>{game.systemWinningNumber}</td>
                      <td>{game.winningNumberByAdmin}</td>
                      <td>{game.winningNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div>
                <button
                  onClick={() => handlePagination(gamesPage - 1, "games")}
                  disabled={gamesPage === 1}
                >
                  Previous
                </button>
                <span>
                  {" "}
                  Page {gamesPage} of {getTotalPages(user.gameHistory)}{" "}
                </span>
                <button
                  onClick={() => handlePagination(gamesPage + 1, "games")}
                  disabled={user.gameHistory.length <= gamesPage * 10}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDetail;
