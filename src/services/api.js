import axios from "axios";

const api = axios.create({
  baseURL: "https://api.fungaming.in/api/admin", // Adjust based on your backend
});

export default api;
