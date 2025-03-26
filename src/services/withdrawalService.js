import api from './api'

export const fetchWithdrawals = async (filters = {}) => {
    try {
      // Make GET request with filters as query params
      const response = await api.get('/withdrawals', { params: filters });
      return response.data.withdrawals;
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      throw error;
    }
  };

  

  

  
