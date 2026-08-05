import axios from 'axios';

// Use your computer's local IP address or emulator loopback
const API = axios.create({
  baseURL: 'http://10.0.2.2:5000/api', // Use http://localhost:5000 if running on iOS simulator
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;