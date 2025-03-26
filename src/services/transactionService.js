import api from './api';  // Assuming `api` is your custom axios instance

// Function to fetch transaction history for a specific user
export const fetchUserTransactionHistory = async (userId) => {
  try {
    const response = await api.get('/transaction-history', {
      params: { userId }
    });
    return response.data.transactionHistory;
  } catch (error) {
    console.error('Error fetching user transaction history:', error);
    throw error;
  }
};
export const fetchUserProfile = async (userId) => {
  try {
    // Make a GET request to the `/view-profile/:userId` endpoint
    const response = await api.get(`/view-user/${userId}`);
    return response.data.user; // Return the user data from the response
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error; // Re-throw the error for further handling
  }
};
export const fetchAgentProfile = async (agentId) => {
  try {
    // Make a GET request to the `/view-profile/:userId` endpoint
    const response = await api.get(`/view-agent/${agentId}`);
    return response.data.agent; // Return the user data from the response
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error; // Re-throw the error for further handling
  }
};
// Function to fetch transaction history for a specific agent
export const fetchAgentTransactionHistory = async (agentId) => {
  try {
    const response = await api.get('/transaction-history', {
      params: { agentId }
    });
    return response.data.transactionHistory;
  } catch (error) {
    console.error('Error fetching agent transaction history:', error);
    throw error;
  }
};

// Function to fetch all transaction histories (for both users and agents)
export const fetchAllTransactionHistory = async () => {
  try {
    const response = await api.get('/transaction-history/all');
    return response.data.transactionHistory;
  } catch (error) {
    console.error('Error fetching all transaction history:', error);
    throw error;
  }
};
