import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

import { Link } from "react-router-dom";
import "./index.css";
import {
  fetchAgents,
  deleteAgent,
  createAgent,
  updateAgent,
  activateAgent,
} from "../services/agentService";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({
    name: "",
    mobile: "",
    walletBalance: 0,
    upiId: "",
    accountNumber: "",
    ifscCode: "",
    isBankingInfo: true, // Default to banking info
  });
  const [editingAgent, setEditingAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(""); // General error message
  const [modalError, setModalError] = useState(""); // Error message specific to the modal
  const [mobile, setMobile] = useState(""); // Mobile input value

  // Fetch agents on component mount
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

  // Handle mobile number changes
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  // Handle input changes for creating or editing agent
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingAgent) {
      setEditingAgent((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewAgent((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle creating a new agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();

    try {
      // Prepare the data for submission
      const agentData = {
        name: newAgent.name,
        mobile: `+91${mobile}`, // Add +91 prefix to mobile number
        wallet: parseFloat(newAgent.walletBalance),
        upiId: newAgent.isBankingInfo ? "" : newAgent.upiId, // Only add UPI if it's not banking info
        bankingInfo: newAgent.isBankingInfo
          ? {
              accountNumber: newAgent.accountNumber,
              ifscCode: newAgent.ifscCode,
            }
          : null, // Only include bankingInfo if the user selected banking info
      };

      // Send the request to create the agent
      await createAgent(agentData);

      // Reset form fields and close modal
      setNewAgent({
        name: "",
        mobile: "",
        walletBalance: 0,
        upiId: "",
        accountNumber: "",
        ifscCode: "",
        isBankingInfo: true,
      });
      setMobile(""); // Reset mobile number
      const updatedAgents = await fetchAgents();
      setAgents(updatedAgents);
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      setModalError("Failed to create the agent. Please try again.");
    }
  };

  // Handle editing an agent
  const handleEditAgent = (agent) => {
    const strippedMobile =
      agent.mobile && agent.mobile.startsWith("+91")
        ? agent.mobile.replace("+91", "")
        : "";

    setEditingAgent(agent);
    setNewAgent({
      name: agent.name,
      mobile: strippedMobile,
      walletBalance: agent.wallet,
      upiId: agent.upiId || "",
      accountNumber: agent.bankingInfo?.accountNumber || "",
      ifscCode: agent.bankingInfo?.ifscCode || "",
      isBankingInfo: !!agent.bankingInfo,
    });
    setMobile(strippedMobile);
    setIsModalOpen(true);
    setModalError(""); // Reset modal error when editing agent
  };

  // Handle updating an agent
  const handleUpdateAgent = async (e) => {
    e.preventDefault();

    try {
      // Prepare the data for submission
      const updatedAgentData = {
        name: editingAgent.name,
        mobile: `+91${mobile}`, // Add +91 prefix to mobile number
        wallet: parseFloat(editingAgent.walletBalance),
        upiId: editingAgent.isBankingInfo ? "" : editingAgent.upiId, // Only add UPI if it's not banking info
        bankingInfo: editingAgent.isBankingInfo
          ? {
              accountNumber: editingAgent.accountNumber,
              ifscCode: editingAgent.ifscCode,
            }
          : null, // Only include bankingInfo if the user selected banking info
      };

      // Send the request to update the agent
      await updateAgent(editingAgent._id, updatedAgentData);

      // Reset the form and update agents list
      const updatedAgents = await fetchAgents();
      setAgents(updatedAgents);
      setIsModalOpen(false); // Close the modal
      setEditingAgent(null); // Reset editing agent
      setMobile(""); // Reset mobile number
    } catch (error) {
      setModalError("Failed to update the agent. Please try again.");
    }
  };

  // Handle deleting an agent
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

  // Handle activating an agent
  const handleActivateAgent = async (agentId) => {
    try {
      await activateAgent(agentId);
      const updatedAgents = await fetchAgents();
      setAgents(updatedAgents);
    } catch (error) {
      console.error("Error activating agent:", error);
    }
  };

  // Close modal
  const closeModal = () => {
    setEditingAgent(null);
    setNewAgent({
      name: "",
      mobile: "",
      walletBalance: 0,
      upiId: "",
      accountNumber: "",
      ifscCode: "",
      isBankingInfo: true,
    });
    setMobile(""); // Ensure mobile is reset
    setIsModalOpen(false);
    setModalError(""); // Clear modal error when closing
  };

  if (loading) {
    return <div>Loading agents...</div>;
  }

  return (
    <Layout>
      <div>
        <h1>Agents List</h1>

        {/* Display general error message */}
        {!isModalOpen && error && <div className="error-message">{error}</div>}

        <button onClick={() => setIsModalOpen(true)}>Add New Agent</button>

        <table>
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Mobile</th>
              <th>Wallet Balance</th>
              <th>Banking Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan="5">No agents found.</td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent._id}>
                  <td>
                    <Link to={`/agent/${agent._id}`}>{agent.name}</Link>
                  </td>
                  <td>{agent.mobile || "N/A"}</td>
                  <td>{agent.wallet}</td>
                  <td>
                    {agent.upiId
                      ? agent.upiId
                      : agent.bankingInfo
                      ? `A/C No: ${agent.bankingInfo.accountNumber} - IFSC CODE : ${agent.bankingInfo.ifscCode}`
                      : "N/A"}
                  </td>
                  <td>
                    {agent.isDeactivated ? (
                      <button className="edit-btn" onClick={() => handleActivateAgent(agent._id)}>
                        Activate
                      </button>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => handleEditAgent(agent)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteAgent(agent._id)}>
                          Deactivate
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Modal for Creating or Editing Agent */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content-main">
              <h3>{editingAgent ? "Edit Agent" : "Create New Agent"}</h3>
              {modalError && <div className="error-message">{modalError}</div>}
              <form
                onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent}
              >
                <div>
                  <label>Agent Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAgent.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={handleMobileChange}
                    maxLength="10"
                    required
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
                  />
                </div>

                {/* Toggle between Banking Info and UPI ID */}
                <div className="row">
                  <label className="col-md-6">
                    <input
                      type="radio"
                      name="isBankingInfo"
                      value="true"
                      checked={newAgent.isBankingInfo}
                      onChange={() =>
                        setNewAgent((prev) => ({
                          ...prev,
                          isBankingInfo: true,
                          upiId: "",
                        }))
                      }
                    />
                    Banking Info
                  </label>
                  <label className="col-md-6">
                    <input
                      type="radio"
                      name="isBankingInfo"
                      value="false"
                      checked={!newAgent.isBankingInfo}
                      onChange={() =>
                        setNewAgent((prev) => ({
                          ...prev,
                          isBankingInfo: false,
                          accountNumber: "",
                          ifscCode: "",
                        }))
                      }
                    />
                    UPI ID
                  </label>
                </div>

                {newAgent.isBankingInfo ? (
                  <>
                    <div>
                      <label>Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={newAgent.accountNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={newAgent.ifscCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label>UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={newAgent.upiId}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <div>
                  <button type="submit">
                    {actionLoading
                      ? "Processing..."
                      : editingAgent
                      ? "Update Agent"
                      : "Create Agent"}
                  </button>
                  <button type="button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Agents;
