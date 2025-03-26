import api from './cronApi'

export const fetchGameStatus = async () => {
    try {
      const response = await api.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  };


  export const toggleGameStatus = async (enable) => {
    try {
      const response = await api.post('/toggle-cron',{ enable });
      return response.data;
    } catch (error) {
      console.error('Error toggling game status:', error);
      throw error;
    }
  };