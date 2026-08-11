import axios from 'axios';

// Live production URL on Render
const API = axios.create({
  baseURL: 'https://restaurant-management-app-wqmp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;