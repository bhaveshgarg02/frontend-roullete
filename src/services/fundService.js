import api from './api';


export const fetchFundRequests = async (filters = {}) => {
    try {
      const response = await api.get('/fund-requests', { params: filters });
      return response.data.fundRequests;
    } catch (error) {
      console.error('Error fetching fund requests:', error);
      throw error;
    }
  };

 
  
  