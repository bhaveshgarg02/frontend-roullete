import React, { useState, useEffect } from "react";
import { fetchUsers } from "../services/userService";
import {
  processAgentWithdrawal,
  verifyOtpAndApproveWithdrawal,
} from "../services/loginAgent";
import LayoutAgent from "./LayoutAgent";

const AgentWithdrawalApprove = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    filterUsers(e.target.value);
  };

  const filterUsers = (query) => {
    if (!query) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) => user.mobile.includes(query))
      );
    }
    setCurrentPage(1);
  };

  // Send OTP for Withdrawal Approval
  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setError("");

    try {
      const agentData = JSON.parse(localStorage.getItem("user"));
      const agentId = agentData ? agentData.id : null;

      if (!agentId) {
        setError("Agent ID is missing. Please log in again.");
        setIsSendingOtp(false);
        return;
      }

      const payload = {
        mobile: selectedUser.mobile,
        agentId: agentId,
        amount: amount,
      };

      const response = await processAgentWithdrawal(payload);

      if (response.message === "OTP sent successfully. Verify to complete withdrawal.") {
        setOtpSent(true);
      } else {
        setError("Failed to send OTP.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Error sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP and Approve Withdrawal
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    const agentData = JSON.parse(localStorage.getItem("user"));
    const agentId = agentData ? agentData.id : null;

    try {
      const payload = {
        mobile: selectedUser.mobile,
        otp: otp,
        amount:amount,
        agentId: agentId
      };

      const response = await verifyOtpAndApproveWithdrawal(payload);

      if (response.message === "Withdrawal approved successfully") {
        alert("Withdrawal approved successfully");
        setShowModal(false);

        const usersData = await fetchUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        setError("Failed to verify OTP and approve withdrawal.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Error verifying OTP.");
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setAmount("");
    setError("");
    setShowModal(true);
    setOtp("");
    setOtpSent(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setAmount("");
    setError("");
    setOtp("");
    setOtpSent(false);
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <LayoutAgent>
      <div>
        <h2>Approve Withdrawal Requests</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Search Bar */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by mobile number"
            className="search-input"
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Mobile</th>
              <th>Wallet</th>
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
                  <td>{user.wallet}</td>
                  <td>{user.upiId}</td>
                  <td>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="edit-btn"
                    >
                      Approve Withdrawal
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

        {/* Modal for withdrawal approval */}
        {showModal && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content-main">
              <h3>Approve Withdrawal for {selectedUser.username}</h3>
              <p>Mobile: {selectedUser.mobile}</p>
              <p>UPI ID: {selectedUser.upiId}</p>
              <p>Wallet Balance: ₹{selectedUser.wallet}</p>
              <label className="modal-label">
                Withdrawal Amount:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={selectedUser.wallet}
                  className="amount-input"
                />
              </label>

              {otpSent && (
                <label className="modal-label">
                  Enter OTP:
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="otp-input"
                  />
                </label>
              )}

              <div className="modal-actions">
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    className="submit-button"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                ) : (
                  <button
                    onClick={handleVerifyOtp}
                    className="submit-button"
                  >
                    Verify and Approve Withdrawal
                  </button>
                )}
                <button onClick={handleCloseModal} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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

export default AgentWithdrawalApprove;
