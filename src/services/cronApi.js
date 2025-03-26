import axios from "axios";

const api = axios.create({
  baseURL: "https://api.fungaming.in/api/cron", // Adjust based on your backend's API endpoint
});

export default api;
