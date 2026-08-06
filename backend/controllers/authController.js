const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Role-based route mapping
    const redirectRoutes = {
      manager: 'ManagerDashboard',
      kitchen: 'KitchenDashboard',
      waiter: 'WaiterDashboard',
      driver: 'DriverDashboard',
      customer: 'CustomerLanding'
    };

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      navigateTo: redirectRoutes[user.role] || 'CustomerLanding'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};