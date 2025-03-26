import React, { useState, useEffect } from "react";
import { fetchFundRequests } from "../services/fundService";
import { requestFund, fetchWalletBalance } from "../services/loginAgent";
import LayoutAgent from "./LayoutAgent";
import moment from "moment-timezone";

const AgentRequestFunds = () => {
  const [fundRequests, setFundRequests] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page for pagination
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Extract agent ID from localStorage
  const agentData = JSON.parse(localStorage.getItem("user"));
  const agentId = agentData?.id;

  useEffect(() => {
    if (!agentId) {
      setError("Agent data not found in localStorage.");
      return;
    }

    // Fetch fund requests for the agent
    const loadFundRequests = async () => {
      try {
        const requests = await fetchFundRequests({ agentId }); // Fetch fund requests filtered by agentId
        setFundRequests(requests);
      } catch (error) {
        console.error("Error loading fund requests:", error);
      }
    };

    loadFundRequests();
  }, [agentId]);

  // Fetch agent's wallet balance
  useEffect(() => {
    if (!agentId) {
      return;
    }

    const loadWalletBalance = async () => {
      try {
        const { walletBalance } = await fetchWalletBalance(agentId);
        setWalletBalance(walletBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    loadWalletBalance();
  }, [agentId]);

  // Handle fund request submission with image
  const handleRequestFund = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!imageFile) {
      alert("Please upload an image as proof of transaction");
      return;
    }

    try {
      const { message } = await requestFund({ agentId, amount, imageFile }); // Send fund request using the service
      alert(message); // Notify the user
      setAmount(""); // Reset amount input
      setImageFile(null); // Reset image input

      // Reload fund requests
      const updatedRequests = await fetchFundRequests({ agentId });
      setFundRequests(updatedRequests);

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error requesting funds:", error);
      alert("Failed to request funds. Please try again later.");
    }
  };

  // Pagination logic
  const paginatedRequests = fundRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(fundRequests.length / itemsPerPage);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <LayoutAgent>
      <div className="container">
        <h1>Agent Fund Requests</h1>
        <p>
          <strong>Wallet Balance:</strong> {walletBalance}
        </p>

        {/* Button to open the modal */}
        <button onClick={() => setIsModalOpen(true)}>Request Fund</button>

        {/* Modal for requesting funds */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-main">
              <span
                className="close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </span>
              <h2>Request Fund</h2>
              <div className="form-container">
                <label>
                  Amount:
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </label>
                <label>
                  Proof of Transaction (Image):
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
                <button onClick={handleRequestFund}>Submit Request</button>
              </div>
            </div>
          </div>
        )}

        {/* Table of Fund Requests */}
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Request Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.amount}</td>
                  <td>{request.status}</td>
                  <td>{moment(request.requestDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No fund requests available.</td>
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

export default AgentRequestFunds;
