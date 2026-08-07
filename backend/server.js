// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

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

// Import Routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- FORGOT PASSWORD ENDPOINT ---
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Instructions - ROMS',
      text: `Hello,\n\nYou requested a password reset for your ROMS account. Please use this request to proceed with updating your password.\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to: ${email}`);
    
    return res.status(200).json({ message: 'Password reset instructions sent successfully.' });
  } catch (error) {
    console.error('Forgot Password Email Error:', error);
    return res.status(500).json({ message: 'Failed to send email. Check server configuration.' });
  }
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db')
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