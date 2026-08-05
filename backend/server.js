// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());
// Add these lines below your middleware configuration in server.js
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io Connection (For Real-Time Kitchen & Order Updates)
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('place_order', (data) => {
    // Broadcast incoming order to kitchen screens in real-time
    io.emit('new_kitchen_order', data);
  });

  socket.on('update_order_status', (data) => {
    // Broadcast status change back to customer/waiter
    io.emit('order_status_updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Test Route
app.get('/', (req, res) => {
  res.send('ROMS Backend API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
