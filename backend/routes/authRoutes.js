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

    // Normalize role and determine redirect route
    const userRole = user.role ? user.role.toLowerCase() : 'customer';
    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    return res.status(200).json({
      success: true,
      token: 'sample-jwt-token-xyz',
      user: { id: user._id, email: user.email, name: user.name, role: userRole },
      navigateTo: redirectRoutes[userRole] || 'CustomerLanding'
    });
  } catch (error) {
    console.error('Login Route Error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- REGISTER / SIGNUP ROUTE (POST /api/auth/signup & /api/auth/register) ---
const handleRegister = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This user already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role ? role.toLowerCase() : 'customer';

    user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: userRole,
    });

    await user.save();

    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully.',
      token: 'sample-jwt-token-xyz',
      user: { id: user._id, email: user.email, name: user.name, role: userRole },
      navigateTo: redirectRoutes[userRole] || 'CustomerLanding'
    });
  } catch (error) {
    console.error('Register Route Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Supporting both /signup and /register to prevent endpoint mismatches
router.post('/signup', handleRegister);
router.post('/register', handleRegister);

// --- GOOGLE OAUTH BACKEND (POST /api/auth/google) ---
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;
    if (!email) return res.status(400).json({ message: 'Google email is required.' });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        name: name || 'Google User', 
        email, 
        password: googleId || crypto.randomBytes(16).toString('hex'), 
        role: 'customer' 
      });
      await user.save();
    }

    const userRole = user.role ? user.role.toLowerCase() : 'customer';
    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    return res.status(200).json({ 
      success: true, 
      token: 'sample-jwt-token-xyz', 
      user: { id: user._id, name: user.name, email: user.email, role: userRole }, 
      navigateTo: redirectRoutes[userRole] || 'CustomerLanding' 
    });
  } catch (error) {
    console.error('Google auth backend error:', error);
    return res.status(500).json({ message: 'Server error during Google authentication.' });
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

// --- GET USER PROFILE (GET /api/auth/profile) ---
router.get('/profile', async (req, res) => {
  try {
    const headerEmail = req.header('x-user-email');
    let user;
    if (headerEmail) {
      user = await User.findOne({ email: headerEmail });
    } else {
      user = await User.findOne();
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+1 234 567 890',
        address: user.address || '123 Main Street, Apt 4B'
      }
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// --- UPDATE USER PROFILE (PUT /api/auth/profile) ---
router.put('/profile', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const headerEmail = req.header('x-user-email');
    let user;
    if (headerEmail) {
      user = await User.findOne({ email: headerEmail });
    } else {
      user = await User.findOne();
    }
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();

    return res.status(200).json({ success: true, message: 'Profile updated successfully.', user: { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// --- UPDATE DELIVERY ADDRESS (PUT /api/auth/address) ---
router.put('/address', async (req, res) => {
  try {
    const { address } = req.body;
    const headerEmail = req.header('x-user-email');
    let user;
    if (headerEmail) {
      user = await User.findOne({ email: headerEmail });
    } else {
      user = await User.findOne();
    }
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.address = address;
    await user.save();

    return res.status(200).json({ success: true, message: 'Address updated successfully.' });
  } catch (error) {
    console.error('Update Address Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Always keep module.exports at the very bottom
module.exports = router;