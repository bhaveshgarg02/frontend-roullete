import api from './api'

export const loginAdmin = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw error;
    }
  };


  export const getAdminProfile = async (email) => {
    try {
      const response = await api.post("/profile", { email });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      throw error;
    }
  };
  
  export const changeAdminPassword = async (data) => {
    try {
      const response = await api.post("/change-password", data);
      return response.data;
    } catch (error) {
      console.error("Error changing admin password:", error);
      throw error;
    }
  };


  export const uploadAdminQRCode = async (adminId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await api.post(`/upload-qrcode/${adminId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Error uploading QR code:", error);
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

  
  export const fetchNotices = async (type, date) => {
    try {
      const params = {};  // Initialize an object to hold query parameters
  
      if (type) params.type = type;  // If type is passed, add to params
      if (date) params.date = date;  // If date is passed, add to params
  
      const response = await api.get('/notices', { params });
      return response.data.notices;  // Return the notices from the API
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  };


  export const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };

  
  export const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/notifications/unread");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      throw error;
    }
  };

  
  export const markNotificationAsRead = async (id) => {
    try {
      const response = await api.put(`/notifications/mark-as-read/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };


  export const markAllNotificationsAsRead = async () => {
    try {
      const response = await api.put("/notifications/mark-all-as-read");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };