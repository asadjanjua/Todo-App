const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();
const validateLogin = require('../middleware/validateLogin');
const validateSignup = require('../middleware/validatesignup');
const authMiddleware = require('../middleware/authMiddleware');

// Protected test route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'This is protected data',
    userId: req.user.id,
    role: req.user.role,
  });
});

// Signup
router.post('/signup', validateSignup, AuthController.signup);

// Login
router.post('/login', validateLogin, AuthController.login);

module.exports = router;
