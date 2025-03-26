  import api from './api';  // Import the configured Axios instance

  // Fetch all users
  export const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      return response.data.users;  // assuming the response structure
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Create a new user
  export const createUser = async (userData) => {
    try {
      const response = await api.post('/create-user', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // Update user details
  export const updateUser = async (userId, userData) => {
    try {
      const response = await api.put(`/update-user/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Delete a user
  export const deleteUser = async (userId) => {
    try {
      const response = await api.delete(`/delete-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };


  export const activateUser = async (userId) => {
    try {
      const response = await api.post(`/activate-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };