import React, { useState, useEffect } from "react";
import "./index.css";
import {
  fetchAgents,
  deleteAgent,
  createAgent,
  updateAgent,
} from "../services/agentService";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    walletBalance: 0,
  });
  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        setError("Failed to fetch agents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, []);

  const handleDeleteAgent = async (agentId) => {
    try {
      setActionLoading(true);
      await deleteAgent(agentId);
      const updatedAgents = await fetchAgents();
      setAgents(updatedAgents);
    } catch (error) {
      setError("Failed to delete the agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);

      const agentData = {
        name: newAgent.name.trim(),
        email: newAgent.email.trim(),
        phone: newAgent.phone.trim(),
        wallet: parseFloat(newAgent.walletBalance),
      };

      if (editingAgent) {
        await updateAgent(editingAgent._id, agentData);
        setEditingAgent(null);
      } else {
        await createAgent(agentData);
      }

      setNewAgent({ name: "", email: "", phone: "", walletBalance: 0 });
      setShowModal(false);
      const updatedAgents = await fetchAgents();
      setAgents(updatedAgents);
    } catch (error) {
      setError("Failed to submit the agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAgent((prev) => ({
      ...prev,
      [name]: name === "walletBalance" ? Math.max(0, value) : value,
    }));
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setNewAgent({
      name: agent.name,
      email: agent.email || "",
      phone: agent.phone || "",
      walletBalance: agent.wallet,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingAgent(null);
    setNewAgent({ name: "", email: "", phone: "", walletBalance: 0 });
    setShowModal(false);
  };

  if (loading) {
    return <div>Loading agents...</div>;
  }

  return (
    <div className="agents-container">
      <h1>Agents List</h1>

      {error && <div className="error-message">{error}</div>}

      <button className="add-btn" onClick={() => setShowModal(true)}>
        Add New Agent
      </button>

      <table>
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>Agent Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Wallet Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.length === 0 ? (
            <tr>
              <td colSpan="6">No agents found.</td>
            </tr>
          ) : (
            agents.map((agent) => (
              <tr key={agent._id}>
                <td>{agent._id}</td>
                <td>{agent.name}</td>
                <td>{agent.email || "N/A"}</td>
                <td>{agent.phone || "N/A"}</td>
                <td>{agent.wallet}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditAgent(agent)}
                    disabled={actionLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteAgent(agent._id)}
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-main">
            <h2>{editingAgent ? "Edit Agent" : "Create New Agent"}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Agent Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newAgent.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newAgent.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label>Wallet Balance</label>
                <input
                  type="number"
                  name="walletBalance"
                  value={newAgent.walletBalance}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Enter wallet balance"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                    !newAgent.name.trim() ||
                    !newAgent.email.trim() ||
                    !newAgent.phone.trim() ||
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Processing..."
                    : editingAgent
                    ? "Update Agent"
                    : "Create Agent"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
