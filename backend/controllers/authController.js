const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const userIdentifier = email || username;

    if (!userIdentifier || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Safely look up user by either email or username field
    const user = await User.findOne({ 
      $or: [{ email: userIdentifier }, { username: userIdentifier }] 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email/username or password' });
    }

    // Normalize role string to lowercase to safeguard against capitalization mismatches in DB
    const userRole = user.role ? user.role.toLowerCase() : 'customer';

    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole
      },
      navigateTo: redirectRoutes[userRole] || 'CustomerLanding'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Register user (Supports both /signup and /register routes)
// @route   POST /api/auth/signup & POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role ? role.toLowerCase() : 'customer'
    });

    return res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Google Auth login/signup
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Please provide email and googleId' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Generate a random temporary password for Google-authenticated users
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(Math.random().toString(36), salt);

      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        profileImage: profileImage || '',
        password: randomPassword,
        role: 'customer'
      });
    }

    const userRole = user.role ? user.role.toLowerCase() : 'customer';

    const token = jwt.sign(
      { id: user._id, role: userRole },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    return res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole
      },
      navigateTo: redirectRoutes[userRole] || 'CustomerLanding'
    });

  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ message: 'Server error during Google authentication', error: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  signup: registerUser,
  googleAuth
};