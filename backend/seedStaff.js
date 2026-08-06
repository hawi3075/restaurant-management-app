const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv'); // Make sure dotenv is required
const User = require('./models/User'); // Adjust path if needed

dotenv.config(); // Load environment variables from .env

const seedUsers = async () => {
  try {
    // Use process.env.MONGODB_URI so it connects to your cloud Atlas database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db');

    const defaultUsers = [
      {
        name: 'Hawi Girma',
        email: 'manager@restaurant.com',
        password: await bcrypt.hash('Manager123!', 10),
        role: 'manager'
      },
      {
        name: 'Chef Alex',
        email: 'kitchen@restaurant.com',
        password: await bcrypt.hash('Kitchen123!', 10),
        role: 'kitchen'
      },
      {
        name: 'Sam Waiter',
        email: 'waiter@restaurant.com',
        password: await bcrypt.hash('Waiter123!', 10),
        role: 'waiter'
      },
      {
        name: 'Daniel Driver',
        email: 'driver@restaurant.com',
        password: await bcrypt.hash('Driver123!', 10),
        role: 'driver'
      }
    ];

    for (const u of defaultUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    }

    console.log('✅ Staff accounts created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();