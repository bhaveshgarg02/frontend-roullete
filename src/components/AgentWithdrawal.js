import React, { useState, useEffect } from "react";
import { fetchWithdrawals } from "../services/withdrawalService"; // Import the service to fetch withdrawals
import { requestWithdrawal } from "../services/loginAgent"; // API to request withdrawal
import LayoutAgent from "./LayoutAgent";
const moment = require("moment-timezone");

const AgentWithdrawal = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set the number of withdrawals per page

  // Fetch the agent ID from localStorage
  const agentData = JSON.parse(localStorage.getItem("user"));
  if (!agentData || !agentData.id) {
    setError("Agent data not found in localStorage.");
  }
  const agentId = agentData.id;

  // Fetch withdrawals for the specific agent
  useEffect(() => {
    const loadWithdrawals = async () => {
      try {
        setLoading(true);
        const fetchedWithdrawals = await fetchWithdrawals({ agentId });

        // Filter only withdrawals with requestType 'agent'
        const agentWithdrawals = fetchedWithdrawals.filter(
          (withdrawal) => withdrawal.requestType === "agent"
        );

        setWithdrawals(agentWithdrawals);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch withdrawals.");
        setLoading(false);
      }
    };

    loadWithdrawals();
  }, [agentId]);

  // Request a withdrawal for the agent
  const handleRequestWithdrawal = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    try {
      const response = await requestWithdrawal({
        agentId,
        amount: withdrawAmount,
      });
      alert(response.message);
      setWithdrawAmount(""); // Reset input field
      // Optionally, re-fetch withdrawals
      const fetchedWithdrawals = await fetchWithdrawals({ agentId });
      // Filter only withdrawals with requestType 'agent'
      const agentWithdrawals = fetchedWithdrawals.filter(
        (withdrawal) => withdrawal.requestType === "agent"
      );
      setWithdrawals(agentWithdrawals);
    } catch (err) {
      setError("Failed to request withdrawal.");
    }
  };
  const sortedWithdrawals = [...withdrawals].sort(
    (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
  );
  // Pagination logic
  const paginatedWithdrawals = sortedWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(withdrawals.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <LayoutAgent>
      <div>
        <h1>Agent Withdrawals</h1>

        {loading && <p>Loading withdrawals...</p>}
        {error && <p className="error">{error}</p>}

        {/* Request Withdrawal Form */}
        <div>
          <h3>Request Withdrawal</h3>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
          />
          <button onClick={handleRequestWithdrawal}>Request Withdrawal</button>
        </div>

        {/* Table for Withdrawals */}
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Request Type</th>
              <th>Request Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWithdrawals.length > 0 ? (
              paginatedWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td>{withdrawal.amount}</td>
                  <td>{withdrawal.status}</td>
                  <td>
                    {withdrawal.requestType === "user"
                      ? "Player"
                      : withdrawal.requestType === "agent"
                      ? "Agent"
                      : withdrawal.requestType === "user-agent"
                      ? "For Player via Agent"
                      : ""}
                  </td>
                  <td>
                    {moment(withdrawal.requestDate)
                      .tz("Asia/Kolkata")
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No withdrawals available for this agent.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="page">
            Page {currentPage} of {totalPages}
          </span>
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

export default AgentWithdrawal;
