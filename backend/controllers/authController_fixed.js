const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser, updateUser } = require('../models/User');
const generateToken = require('../utils/generateToken');

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, email, and password are required.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password must be at least 6 characters.'
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'User with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashedPassword });

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id),
        },
        message: 'User registered successfully.'
      });
    }

    res.status(400).json({
      success: false,
      data: null,
      message: 'Failed to create user.'
    });
  } catch (error) {
    console.error('Register user error:', error);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password.'
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      },
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password must be at least 6 characters.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'If this email exists, password has been reset.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUser(user.id, { password: hashedPassword });

    res.json({
      success: true,
      data: null,
      message: 'Password reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Not authorized.'
      });
    }

    res.json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      message: 'User retrieved successfully.'
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  getCurrentUser,
};
