import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchFundRequests } from "../services/fundService";
import { processFundRequest } from "../services/gameService";
import { fetchUsers } from "../services/userService";
import { fetchAgents } from "../services/agentService";
import moment from "moment-timezone";

const FundRequests = () => {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    userId: "",
    agentId: "",
    status: "",
    requestType: "",
  });

  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  // Search & Dropdown States
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [searchQueryAgents, setSearchQueryAgents] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);

  // Fetch Fund Requests
  useEffect(() => {
    const loadFundRequests = async () => {
      setLoading(true); // Start loading
      try {
        const requests = await fetchFundRequests(filters);
        setFilteredRequests(requests);
      } catch (error) {
        console.error("Error loading fund requests:", error);
      }
      setLoading(false); // Stop loading
    };
    loadFundRequests();
  }, [filters]);


  // Fetch Users & Agents
  useEffect(() => {
    const loadUsersAndAgents = async () => {
      try {
        const [fetchedUsers, fetchedAgents] = await Promise.all([
          fetchUsers(),
          fetchAgents(),
        ]);
        setUsers(fetchedUsers);
        setAgents(fetchedAgents);
      } catch (error) {
        console.error("Error loading users and agents:", error);
      }
    };
    loadUsersAndAgents();
  }, []);

  // Search Users
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQueryUsers.toLowerCase())
      )
    );
  }, [searchQueryUsers, users]);

  // Search Agents
  useEffect(() => {
    setFilteredAgents(
      agents.filter((agent) =>
        agent.name.toLowerCase().includes(searchQueryAgents.toLowerCase())
      )
    );
  }, [searchQueryAgents, agents]);

  // Paginate Requests
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Page Change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Process Fund Request
  const handleProcessFundRequest = async (fundRequestId, action) => {
    try {
      await processFundRequest(fundRequestId, action);
      const updatedRequests = await fetchFundRequests(filters);
      setFilteredRequests(updatedRequests);
    } catch (error) {
      console.error("Error processing fund request:", error);
    }
  };

  // Handle Filter Change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle User Select
  const handleUserSelect = (user) => {
    setFilters({ ...filters, userId: user._id });
    setSearchQueryUsers(user.username);
    setFilteredUsers([]); // Reset filtered list
  };

  // Handle Agent Select
  const handleAgentSelect = (agent) => {
    setFilters({ ...filters, agentId: agent._id });
    setSearchQueryAgents(agent.name);
    setFilteredAgents([]); // Reset filtered list
  };

  // Handle key press for real-time filter update
  const handleUserSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      // Clear the filter if the search box is empty
      if (searchQueryUsers === "") {
        setFilters((prevFilters) => ({
          ...prevFilters,
          userId: "",
        }));
      }
    }
  };

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <Layout>
      <div>
        <h1>Buy Coin Requests</h1>

        {/* Filters */}
        <div className="row">
          <label className="col-md-3">
            Player:
            <input
              type="text"
              placeholder="Search players..."
              value={searchQueryUsers}
              onChange={(e) => setSearchQueryUsers(e.target.value)}
              onBlur={() => setTimeout(() => setFilteredUsers([]), 200)} // Delay hiding
              onKeyUp={handleUserSearchKeyPress} // Trigger real-time filter update
            />
            {searchQueryUsers && filteredUsers.length > 0 && (
              <ul className="dropdown-list">
                {filteredUsers.map((user) => (
                  <li key={user._id} onMouseDown={() => handleUserSelect(user)}>
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label className="col-md-3">
            Agent:
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQueryAgents}
              onChange={(e) => setSearchQueryAgents(e.target.value)}
              onBlur={() => setTimeout(() => setFilteredAgents([]), 200)} // Delay hiding
            />
            {searchQueryAgents && filteredAgents.length > 0 && (
              <ul className="dropdown-list">
                {filteredAgents.map((agent) => (
                  <li
                    key={agent._id}
                    onMouseDown={() => handleAgentSelect(agent)}
                  >
                    {agent.name}
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label className="col-md-3">
            Status:
            <select
              name="status"
              onChange={handleFilterChange}
              value={filters.status}
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="col-md-3">
            Request Type:
            <select
              name="requestType"
              onChange={handleFilterChange}
              value={filters.requestType}
            >
              <option value="">All Request Types</option>
              <option value="direct-user">Direct Player</option>
              <option value="user-agent">For Player By Agent</option>
              <option value="direct-agent">Direct Agent</option>
            </select>
          </label>
        </div>

        {/* Fund Requests Table */}
        
        {loading ? (
          <p className="loading-text">Loading coin requests...</p> // Loader
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
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.userId?.username || "N/A"}</td>
                  <td>{request.agentId?.name || "N/A"}</td>

                  {/* Make the Amount clickable only if it's "direct-user" or "direct-agent" */}
                  <td>
                    {request.requestType === "direct-user" ||
                    request.requestType === "direct-agent" ? (
                      <a
                        href={request.imageProof}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {request.amount}
                      </a>
                    ) : (
                      request.amount
                    )}
                  </td>

                  <td>{request.status}</td>
                  <td>
                    {request.requestType === "direct-user"
                      ? "Player"
                      : request.requestType === "direct-agent"
                      ? "Agent"
                      : request.requestType === "user-agent"
                      ? "For Player via Agent"
                      : ""}
                  </td>
                  <td>
                    {moment(request.requestDate)
                      .tz("Asia/Kolkata")
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td>
                    {request.status === "pending" && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleProcessFundRequest(request._id, "approve")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleProcessFundRequest(request._id, "reject")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No Buy Coin Requests available.</td>
              </tr>
            )}
          </tbody>
        </table>
        </>
      )}

        {/* Pagination */}
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
    </Layout>
  );
};

export default FundRequests;
