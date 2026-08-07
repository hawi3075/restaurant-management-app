const express = require('express');
const router = express.Router();
const { loginUser, registerUser, signup, googleAuth } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/signup', signup);       // Handles frontend requests to /api/auth/signup
router.post('/register', registerUser); // Handles requests to /api/auth/register
router.post('/google', googleAuth);    // Handles Google authentication requests

module.exports = router;