import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchUsers } from "../services/userService";
import { fetchAgents } from "../services/agentService";
import {
  fetchUserTransactionHistory,
  fetchAgentTransactionHistory,
  fetchAllTransactionHistory,
} from "../services/transactionService";
const moment = require("moment-timezone");

const TransactionHistory = () => {
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [userId, setUserId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [searchQueryAgents, setSearchQueryAgents] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Fetch users, agents, and all transaction history on component mount
  useEffect(() => {
    // Inside the useEffect for all transactions
const fetchData = async () => {
  setLoading(true);
  setError("");
  try {
    const [fetchedUsers, fetchedAgents, fetchedTransactionHistory] =
      await Promise.all([
        fetchUsers(),
        fetchAgents(),
        fetchAllTransactionHistory(),
      ]);
    setUsers(fetchedUsers);
    setAgents(fetchedAgents);

    // Sort transactions by date (latest first)
    const sortedTransactions = fetchedTransactionHistory.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );
    setTransactionHistory(sortedTransactions);
  } catch (err) {
    setError("Failed to fetch users, agents, or transaction history.");
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, []);

  // Fetch transaction history for a specific user
  useEffect(() => {
    if (!userId) return;
    // Inside useEffect for user transactions
const fetchUserTransactions = async () => {
  setLoading(true);
  setError("");
  try {
    const data = await fetchUserTransactionHistory(userId);

    // Sort transactions by date (latest first)
    const sortedData = data.sort(
      (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
    );
    setTransactionHistory(sortedData);
    setCurrentPage(1);
  } catch (err) {
    setError("Failed to fetch player transaction history.");
  } finally {
    setLoading(false);
  }
};

    fetchUserTransactions();
  }, [userId]);

  // Fetch transaction history for a specific agent
  useEffect(() => {
    if (!agentId) return;
    const fetchAgentTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAgentTransactionHistory(agentId);
    
        // Sort transactions by date (latest first)
        const sortedData = data.sort(
          (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
        );
        setTransactionHistory(sortedData);
        setCurrentPage(1);
      } catch (err) {
        setError("Failed to fetch agent transaction history.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgentTransactions();
  }, [agentId]);

  // Handle search for users (players)
  const handleSearchChangeUsers = (e) => {
    const query = e.target.value;
    setSearchQueryUsers(query);
    const filtered = users.filter((user) =>
      user.username?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Handle search for agents
  const handleSearchChangeAgents = (e) => {
    const query = e.target.value;
    setSearchQueryAgents(query);
    const filtered = agents.filter((agent) =>
      agent.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactionHistory.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div>
        <h1>Transaction History</h1>

        <div className="row">
          {/* Search and Dropdown for selecting a User */}
          <div className="col-md-4">
            <label>Player: </label>
            <input
              type="text"
              placeholder="Search players..."
              value={searchQueryUsers}
              onChange={handleSearchChangeUsers}
            />
            {searchQueryUsers && filteredUsers.length > 0 && (
              <ul className="dropdown-list">
                {filteredUsers.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => {
                      setUserId(user._id);
                      setSearchQueryUsers(user.username);
                      setFilteredUsers([]);
                    }}
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search and Dropdown for selecting an Agent */}
          <div className="col-md-4">
            <label>Agent: </label>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQueryAgents}
              onChange={handleSearchChangeAgents}
            />
            {searchQueryAgents && filteredAgents.length > 0 && (
              <ul className="dropdown-list">
                {filteredAgents.map((agent) => (
                  <li
                    key={agent._id}
                    onClick={() => {
                      setAgentId(agent._id);
                      setSearchQueryAgents(agent.name);
                      setFilteredAgents([]);
                    }}
                  >
                    {agent.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Button to fetch all transaction history */}
          <div className="col-md-4 mt-4">
          <button
  onClick={async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllTransactionHistory();
      
      // Sort transactions by date (latest first)
      const sortedData = data.sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
      );
      setTransactionHistory(sortedData);
      setCurrentPage(1); // Reset to the first page
    } catch (err) {
      setError("Failed to fetch all transaction history.");
    } finally {
      setLoading(false);
    }
  }}
>
  Fetch All Transactions
</button>

          </div>
        </div>

        {/* Loading and error handling */}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {/* Display All Transactions in a Combined Table */}
        <h2>All Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((txn, index) => (
                <tr key={txn.transactionId || index}>
                  <td>{txn.transactionId}</td>
                  <td>{txn.userName || txn.agentName}</td>
                  <td>{txn.transactionType}</td>
                  <td>{txn.description}</td>
                  <td>
                    {moment(txn.transactionDate)
                      .tz("Asia/Kolkata")
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td>{txn.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No transaction history available.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="mt-1">
            Page {currentPage} of{" "}
            {Math.ceil(transactionHistory.length / transactionsPerPage)}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={
              currentPage ===
              Math.ceil(transactionHistory.length / transactionsPerPage)
            }
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
