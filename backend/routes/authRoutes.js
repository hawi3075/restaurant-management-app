// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- LOGIN ROUTE (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ 
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }] 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials - user not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials - incorrect password.' });
    }

    return res.status(200).json({
      success: true,
      token: 'sample-jwt-token-xyz',
      user: { id: user._id, email: user.email, name: user.name },
      navigateTo: 'CustomerLanding'
    });
  } catch (error) {
    console.error('Login Route Error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- REGISTER ROUTE (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register Route Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- FORGOT PASSWORD ENDPOINT (POST /api/auth/forgot-password) ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Instructions - ROMS',
      text: `Hello,\n\nYou requested a password reset for your ROMS account. Your reset token is:\n\n${token}\n\nCopy and paste this into your app.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to: ${email}`);
    
    return res.status(200).json({ message: 'Password reset instructions sent successfully.' });
  } catch (error) {
    console.error('Forgot Password Email Error:', error);
    return res.status(500).json({ message: 'Failed to send email. Check server configuration.' });
  }
});

// --- RESET PASSWORD ENDPOINT (POST /api/auth/reset-password/:token) ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Password has been successfully updated.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;