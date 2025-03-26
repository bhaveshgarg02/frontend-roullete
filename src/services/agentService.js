import api from './api';

// Fetch all agents
export const fetchAgents = async () => {
  try {
    const response = await api.get('/agents');
    return response.data.agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Create a new agent
export const createAgent = async (agentData) => {
  try {
    const response = await api.post('/create-agent', agentData);
    return response.data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

// Update agent details
export const updateAgent = async (agentId, agentData) => {
  try {
    const response = await api.put(`/update-agent/${agentId}`, agentData);
    return response.data.agent;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

// Delete an agent
export const deleteAgent = async (agentId) => {
  try {
    const response = await api.delete(`/delete-agent/${agentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};
export const activateAgent = async (userId) => {
  try {
    const response = await api.put(`/activate-agent/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
