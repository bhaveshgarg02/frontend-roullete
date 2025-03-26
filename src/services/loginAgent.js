import api from './agentApi'; // Import your API instance

// 1. Login Agent (Generate OTP)
export const loginAgent = async (credentials) => {
  try {
    const response = await api.post('/login-new', { mobile: credentials.mobile });
    return response.data;  // Returns the message and mobile
  } catch (error) {
    console.error('Error logging in agent:', error);
    throw error;
  }
};

// 2. Verify OTP for Agent Login
export const verifyOtp = async (credentials) => {
  try {
    const response = await api.post('/verify-otp', {
      mobile: credentials.mobile,
      otp: credentials.otp
    });
    return response.data;  // Returns the message and agent details
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};


// Request Fund API
export const requestFund = async ({ agentId, amount, imageFile }) => {
  try {
    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append('agentId', agentId);
    formData.append('amount', amount);
    formData.append('image', imageFile); // 'image' is the field name for the file

    // Send a POST request with the form data (including the image file)
    const response = await api.post('/request-fund', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
      },
    });

    return response.data; // Returns success message and fundRequest object
  } catch (error) {
    console.error('Error requesting fund:', error);
    throw error;
  }
};


export const processAgentWithdrawal = async ({ mobile, amount, agentId }) => {
  try {
    const response = await api.post('/agent-process-withdrawal', { mobile, amount, agentId });
    return response.data; // Returns success message, transaction, and withdrawal objects
  } catch (error) {
    console.error('Error processing agent withdrawal:', error);
    throw error;
  }
};

export const verifyOtpAndApproveWithdrawal = async ({ mobile, otp, amount, agentId }) => {
  try {
    const response = await api.post('/agent-verify-otp-and-approve', {
      mobile,
      otp,
      amount,
      agentId
    });
    return response.data; // Returns success message, transaction, and withdrawal objects
  } catch (error) {
    console.error('Error verifying OTP and approving withdrawal:', error);
    throw error;
  }
};

export const processUserFundRequest = async ({ mobile, amount, agentId }) => {
  try {
    const response = await api.post('/agent-process-fund-request', { mobile, amount, agentId });
    return response.data; // Returns success message, transaction, and withdrawal objects
  } catch (error) {
    console.error('Error processing agent withdrawal:', error);
    throw error;
  }
};

// Fetch Wallet Balance API
export const fetchWalletBalance = async (agentId) => {
  try {
    const response = await api.get('/wallet-balance', { params: { agentId } });
    return response.data; // Returns walletBalance in the response
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
};


// Request Agent Withdrawal API
export const requestWithdrawal = async ({ agentId, amount }) => {
  try {
    const response = await api.post('/request-agent-withdrawal', { agentId, amount });
    return response.data; // Returns success message and withdrawalRequest object
  } catch (error) {
    console.error('Error requesting agent withdrawal:', error);
    throw error;
  }
};

// Agent Process Fund Request API
export const agentProcessFundRequest = async ({ fundRequestId, action, userId }) => {
  try {
    const response = await api.post('/agent-process-fund-request', { fundRequestId, action, userId });
    return response.data; // Returns success message and details
  } catch (error) {
    console.error('Error processing fund request:', error);
    throw error;
  }
};

export const getAgentNotices = async (agentId) => {
  try {
    const response = await api.get(`/get-agent-notices/${agentId}`);
    return response.data; // Returns notice specific to the agent
  } catch (error) {
    console.error('Error fetching agent notice:', error);
    throw error;
  }
};


//   export const loginAgent = async (data) => {
//     try {
//       if (data.otp) {
//         const response = await api.post('/verify-otp', data); // Verify OTP
//         return response.data;
//       } else {
//         const response = await api.post('/login', data); // Send mobile
//         return response.data;
//       }
//     } catch (error) {
//       console.error('Error during agent login:', error);
//       throw error;
//     }
//   };
  