import React, { useState, useEffect } from "react";
import { fetchUsers } from "../services/userService"; // API service to fetch all users
import {
  processUserFundRequest,
  fetchWalletBalance,
} from "../services/loginAgent"; // API services
import LayoutAgent from "./LayoutAgent";

const AgentTransferFunds = () => {
  const [users, setUsers] = useState([]); // State to store all users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users for search
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user for fund transfer
  const [amount, setAmount] = useState(""); // Amount for fund transfer
  const [error, setError] = useState(""); // Error state to display any issues
  const [walletBalance, setWalletBalance] = useState(0); // Store agent's wallet balance
  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering users
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 5; // Items per page for pagination

  const agentData = JSON.parse(localStorage.getItem("user")); // Get agent data from localStorage
  const agentId = agentData ? agentData.id : null; // Extract agent ID

  // Fetch agent wallet balance when the component loads
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (agentId) {
          const { walletBalance } = await fetchWalletBalance(agentId);
          setWalletBalance(walletBalance); // Set wallet balance
        } else {
          setError("Agent ID is missing. Please log in again.");
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
        setError("Failed to fetch wallet balance.");
      }
    };

    fetchBalance();
  }, [agentId]); // Dependency on agentId ensures it fetches only when agentId is available

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers(); // Fetch all users from the API
        setUsers(usersData); // Store the users data in state
        setFilteredUsers(usersData); // Set filtered users initially as all users
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  // Filter users based on search query
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = users.filter(
      (user) =>
        user._id.toLowerCase().includes(query.toLowerCase()) || // Match user ID
        user.mobile.toLowerCase().includes(query.toLowerCase()) // Match mobile number
    );
    setFilteredUsers(filtered); // Update the filtered list of users
    setCurrentPage(1); // Reset to the first page when the search query changes
  };

  // Handle fund transfer approval
  const handleApproveFundTransfer = async (userId) => {
    try {
      // Validate the transfer amount
      if (!amount || amount <= 0) {
        setError("Please enter a valid transfer amount.");
        return;
      }

      if (amount > walletBalance) {
        setError("Insufficient wallet balance to complete the transfer.");
        return;
      }

      // Construct the payload with the selected user's data
      const payload = {
        mobile: selectedUser.mobile, // Send the mobile number instead of userId
        agentId: agentId, // Agent ID from localStorage
        amount: amount, // Amount for the fund transfer
      };

      // Call the API to process the fund transfer
      const response = await processUserFundRequest(payload);

      // If the fund transfer is successful, show success message, update wallet balance, and close modal
      if (response.message === "Fund request processed successfully") {
        alert("Fund transfer approved successfully");
        setShowModal(false); // Close the modal after approval

        // Reload agent wallet balance
        const { walletBalance: updatedBalance } = await fetchWalletBalance(
          agentId
        );
        setWalletBalance(updatedBalance); // Update wallet balance

        // Reload users data after processing the fund transfer
        const usersData = await fetchUsers();
        setUsers(usersData);
        setFilteredUsers(usersData); // Update filtered users after fund transfer
      } else {
        setError("Failed to approve fund transfer.");
      }
    } catch (err) {
      console.error("Error processing fund transfer:", err);
      setError("Error processing fund request.");
    }
  };

  // Handle selection of user for fund transfer
  const handleSelectUser = (user) => {
    setSelectedUser(user); // Set the selected user
    setAmount(""); // Reset amount input field
    setError(""); // Reset error message
    setShowModal(true); // Show modal when a user is selected for approval
  };

  // Modal close handler
  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setSelectedUser(null); // Reset selected user
    setAmount(""); // Reset amount
    setError(""); // Reset error
  };

  // Pagination logic
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <LayoutAgent>
      <div>
        <h2>Approve Fund Transfer Requests</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Display agent wallet balance */}
        <div>
          <h4>Agent Wallet Balance: ₹{walletBalance}</h4>
        </div>

        {/* Search Box */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Mobile Number"
            style={{
              padding: "8px",
              fontSize: "14px",
              width: "100%",
              maxWidth: "400px",
              marginBottom: "20px",
              display: "block",
              margin: "auto",
            }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Mobile</th>
              <th>Wallet</th> {/* New column for wallet */}
              <th>Banking Info (UPI ID)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.mobile}</td>
                  <td>{user.wallet}</td> {/* Display user's wallet balance */}
                  <td>{user.upiId}</td>
                  <td>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="edit-btn"
                    >
                      Approve Fund Transfer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users found.</td>
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

        {/* Modal for fund transfer approval */}
        {showModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content-main">
              <h3>Approve Fund Transfer for {selectedUser.username}</h3>
              <p>Mobile: {selectedUser.mobile}</p>
              <p>UPI ID: {selectedUser.upiId}</p>
              <p>Wallet Balance: ₹{selectedUser.wallet}</p>{" "}
              {/* Display wallet balance in modal */}
              <label className="modal-label">
                Transfer Amount:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={walletBalance} // Prevent transfer amount more than agent's wallet balance
                  className="amount-input"
                />
              </label>
              <div className="modal-actions">
                <button
                  onClick={() => handleApproveFundTransfer(selectedUser._id)}
                  className="submit-button"
                >
                  Approve Fund Transfer
                </button>
                <button onClick={handleCloseModal} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutAgent>
  );
};

export default AgentTransferFunds;
