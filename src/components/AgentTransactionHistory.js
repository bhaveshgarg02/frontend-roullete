import React, { useState, useEffect } from "react";
import { fetchAgentTransactionHistory } from "../services/transactionService";
import LayoutAgent from "./LayoutAgent";
const moment = require("moment-timezone");

const AgentTransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page for pagination

  // Fetch the transaction history of the agent from localStorage
  useEffect(() => {
    const fetchData = async () => {
      // Get agent data from localStorage
      const agentData = JSON.parse(localStorage.getItem("user"));

      if (!agentData || !agentData.id) {
        setError("Agent data not found in localStorage.");
        return;
      }

      const agentId = agentData.id; // Get agent ID

      setLoading(true);
      setError("");
      try {
        // Fetch the transaction history for the agent using their ID
        const agentTransactionHistory = await fetchAgentTransactionHistory(agentId);

        // Sort the data so that the latest transactions come first
        const sortedTransactions = agentTransactionHistory.sort((a, b) =>
          new Date(b.transactionDate) - new Date(a.transactionDate)
        );

        setTransactionHistory(sortedTransactions);
      } catch (err) {
        setError("Failed to fetch agent transaction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Paginate transactions
  const paginatedTransactions = transactionHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(transactionHistory.length / itemsPerPage);

  return (
    <LayoutAgent>
      <div>
        <h1>Agent Transaction History</h1>

        {/* Loading and error handling */}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {/* Display Agent's Transaction History in a Table */}
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
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn, index) => (
                <tr key={txn.transactionId || index}>
                  <td>{txn.transactionId}</td>
                  <td>{txn.agentName}</td>
                  <td>{txn.transactionType}</td>
                  <td>{txn.description}</td>
                  <td>{moment(txn.transactionDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
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
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </LayoutAgent>
  );
};

export default AgentTransactionHistory;
