import axios from "axios";

const api = axios.create({
  baseURL: "https://api.fungaming.in/agent",
});

export default api;
