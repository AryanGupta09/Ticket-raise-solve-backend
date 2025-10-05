const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          field: 'email',
          message: 'User with this email already exists'
        }
      });
    }

    // Create new user with hashed password
    const user = new User({ 
      email, 
      password, // Password will be hashed by the model's pre-save middleware
      name, 
      role: role || 'user' 
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error:', error);
    }
    res.status(500).json({
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
    }
    res.status(500).json({
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to login',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
};

const getProfile = async (req, res) => {
  res.json({
    user: req.user.toJSON()
  });
};

module.exports = {
  register,
  login,
  getProfile
};