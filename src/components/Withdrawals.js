import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchWithdrawals } from "../services/withdrawalService"; // Fetch withdrawals
import { fetchUsers } from "../services/userService"; // Fetch users
import { fetchAgents } from "../services/agentService"; // Fetch agents
import { processWithdrawal } from "../services/gameService"; // Process withdrawals
const moment = require("moment-timezone");

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchUsers, setSearchUsers] = useState("");
  const [searchAgents, setSearchAgents] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [filters, setFilters] = useState({
    userId: "",
    agentId: "",
    status: "",
    requestType: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalsPerPage] = useState(10); // Number of withdrawals per page

  // Fetch withdrawals
  useEffect(() => {
    const loadWithdrawals = async () => {
      setLoading(true); // Start loading
      try {
        const fetchedWithdrawals = await fetchWithdrawals(filters);
        setWithdrawals(fetchedWithdrawals);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
      }
      setLoading(false); // Stop loading
    };
    loadWithdrawals();
  }, [filters]);

  // Fetch users and agents
  useEffect(() => {
    const loadUsersAndAgents = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        const fetchedAgents = await fetchAgents();
        setUsers(fetchedUsers);
        setAgents(fetchedAgents);
      } catch (error) {
        console.error("Error loading users and agents:", error);
      }
    };
    loadUsersAndAgents();
  }, []);

  // Search functionality for users
  // Search functionality for users
const handleUserSearch = (e) => {
  const query = e.target.value;
  setSearchUsers(query);

  if (query === "") {
    setFilteredUsers([]); 
    setFilters((prevFilters) => ({ ...prevFilters, userId: "" })); // Reset filter
  } else {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
};

// Search functionality for agents
const handleAgentSearch = (e) => {
  const query = e.target.value;
  setSearchAgents(query);

  if (query === "") {
    setFilteredAgents([]);
    setFilters((prevFilters) => ({ ...prevFilters, agentId: "" })); // Reset filter
  } else {
    setFilteredAgents(
      agents.filter((agent) =>
        agent.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
};


  // Update filters when a user or agent is selected
  const handleSelectUser = (userId) => {
    const selectedUser = users.find((user) => user._id === userId);
    setFilters((prevFilters) => ({ ...prevFilters, userId }));
    setSearchUsers(selectedUser ? selectedUser.username : ""); // Keep selected user's name
    setFilteredUsers([]);
  };
  
  const handleSelectAgent = (agentId) => {
    const selectedAgent = agents.find((agent) => agent._id === agentId);
    setFilters((prevFilters) => ({ ...prevFilters, agentId }));
    setSearchAgents(selectedAgent ? selectedAgent.name : ""); // Keep selected agent's name
    setFilteredAgents([]);
  };
  

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Pagination logic
  // Sort withdrawals first before pagination
const sortedWithdrawals = [...withdrawals].sort(
  (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
);

// Apply pagination after sorting
const indexOfLastWithdrawal = currentPage * withdrawalsPerPage;
const indexOfFirstWithdrawal = indexOfLastWithdrawal - withdrawalsPerPage;
const currentWithdrawals = sortedWithdrawals.slice(
  indexOfFirstWithdrawal,
  indexOfLastWithdrawal
);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle processing the withdrawal (approve/reject)
  const handleProcessWithdrawal = async (withdrawalId, action) => {
    try {
      const message = await processWithdrawal(withdrawalId, action);
      alert(message);
      window.location.reload();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Failed to process withdrawal");
    }
  };

  return (
    <Layout>
      <div>
        <h2>Withdrawals</h2>

        {/* Filters */}
        <div className="row">
          {/* Search for Users */}
          <div className="col-md-3">
            <label>Player:</label>
            <input
              type="text"
              placeholder="Search players..."
              value={searchUsers}
              onChange={handleUserSearch}
            />
            {searchUsers && filteredUsers.length > 0 && (
              <ul className="dropdown-list">
                {filteredUsers.map((user) => (
                  <li key={user._id} onClick={() => handleSelectUser(user._id)}>
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search for Agents */}
          <div className="col-md-3">
            <label>Agent:</label>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchAgents}
              onChange={handleAgentSearch}
            />
            {searchAgents && filteredAgents.length > 0 && (
              <ul className="dropdown-list">
                {filteredAgents.map((agent) => (
                  <li
                    key={agent._id}
                    onClick={() => handleSelectAgent(agent._id)}
                  >
                    {agent.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filter by Status */}
          <label className="col-md-3 mt-4">
            Status:
            <select
              name="status"
              onChange={handleFilterChange}
              value={filters.status}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          {/* Filter by Request Type */}
          <label className="col-md-3 mt-4">
            Request Type:
            <select
              name="requestType"
              onChange={handleFilterChange}
              value={filters.requestType}
            >
              <option value="">All Request Types</option>
              <option value="user">Player</option>
              <option value="agent">Agent</option>
              <option value="user-agent">For Player Via Agent</option>

            </select>
          </label>
        </div>

        {/* Table of Withdrawals */}
        {loading ? (
          <p className="loading-text">Loading withdrawals...</p> // Loader
        ) : (
          <>

        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Agent</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Request Type</th>
              <th>Request Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {currentWithdrawals.length > 0 ? (
    currentWithdrawals.map((withdrawal) => {
      // Find user and agent names
      const user = users.find((u) => u._id === withdrawal.userId);
      const agent = agents.find((a) => a._id === withdrawal.agentId);
        return (
        <tr key={withdrawal._id}>
          <td>{user ? user.username : "N/A"}</td>
          <td>{agent ? agent.name : "N/A"}</td>
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
          <td>
            {withdrawal.status === "pending" && (
              <>
                <button className="edit-btn"
                  onClick={() => handleProcessWithdrawal(withdrawal._id, "approve")}
                >
                  Approve
                </button>
                <button className="delete-btn"
                  onClick={() => handleProcessWithdrawal(withdrawal._id, "reject")}
                >
                  Reject
                </button>
              </>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="7">No withdrawals available.</td>
    </tr>
  )}
</tbody>

        </table>
        </>
        )}

        {/* Pagination */}
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(withdrawals.length / withdrawalsPerPage) },
            (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Withdrawals;
