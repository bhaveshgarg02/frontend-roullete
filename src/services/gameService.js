import api from './gameApi';  // Import the configured Axios instance

// Fetch the live game data
export const fetchLiveGame = async () => {
  try {
    const response = await api.get('/live');
    return response.data;  // Assuming the response structure has the live game data
  } catch (error) {
    console.error('Error fetching live game:', error);
    throw error;
  }
};

// Place a bid for a game
export const placeBid = async (gameNumber, userId, bidNumber, bidAmount) => {
  try {
    const response = await api.post('/bid', {
      gameNumber,
      userId,
      number: bidNumber,
      amount: bidAmount,
    });
    return response.data;  // Assuming the response structure returns the updated game info
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

// Set the winning number for a game manually
export const manualapiWinningNumber = async (gameNumber, winningNumber) => {
  try {
    const response = await api.post('/manual-winning_number-byadmin', {
      gameNumber,
      winningNumber,
    });
    return response.data;  // Assuming the response contains success message
  } catch (error) {
    console.error('Error setting winning number:', error);
    throw error;
  }
};

export const setgamemultiplier = async (gameNumber, newMultiplier) => {
  try {
    const response = await api.post('/updateMultiplier', {
      gameNumber,
      newMultiplier,
    });
    return response.data;  // Assuming the response contains success message
  } catch (error) {
    console.error('Error setting winning number:', error);
    throw error;
  }
};

export const fetchAllGames = async ({ date = '', page = 1 }) => {  // Default `page` to 1 if not provided
  try {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    if (page) queryParams.append('page', page);

    // Make the API request
    const response = await api.get(`/all-games?${queryParams.toString()}`);

    // Check if the response data has the expected structure
    if (response.data && Array.isArray(response.data.games)) {
      return response.data; // Assuming the response contains { games: [], totalPages: number }
    } else {
      throw new Error("Invalid response structure, 'games' not found");
    }
  } catch (error) {
    console.error('Error fetching all games:', error);
    throw error;  // You can throw the error to be caught by the caller
  }
};


export const processWithdrawal = async (withdrawalId, action) => {
  try {
    const response = await api.post('/process-withdrawal', { withdrawalId, action });
    return response.data.message;  // Return the success message
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error;
  }
};



 
export const processFundRequest = async (fundRequestId, action) => {
  try {
    const response = await api.post('/process-fund-request', { fundRequestId, action });
    return response.data.message;  // The success message
  } catch (error) {
    console.error('Error processing fund request:', error);
    throw error;
  }
};


export const sendNotice = async (message, type) => {
  try {
    const response = await api.post('/send-notice', { message, type });
    return response.data;  // Return the response from the API
  } catch (error) {
    console.error('Error sending notice:', error);
    throw error;
  }
};
