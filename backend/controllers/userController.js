const bcrypt = require('bcryptjs');
const {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
} = require('../models/User');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getAllUsers = async (req, res, next) => {
  try {
    const users = await findAllUsers();
    res.json({
      success: true,
      data: users || [],
      message: 'Users retrieved successfully.'
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        data: null,
        message: 'Invalid user ID.' 
      });
    }

    const user = await findUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({ 
        success: false,
        data: null,
        message: 'User not found.' 
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      message: 'User retrieved successfully.'
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    next(error);
  }
};

const createNewUser = async (req, res, next) => {
  try {
    const { name, email, role, status, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name and email are required.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid email format.'
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A user already exists with this email.'
      });
    }

    const demoPassword = password || 'Demo1234';
    if (demoPassword.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password must be at least 6 characters.'
      });
    }

    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'Utilisateur',
      status: status || 'Actif',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || status || 'Actif',
        created_at: user.created_at || new Date(),
      },
      message: 'User created successfully.'
    });
  } catch (error) {
    console.error('Create user error:', error);
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        data: null,
        message: 'User not found.' 
      });
    }
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully.'
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    // If updating via /:id route, use the ID from params, otherwise use req.user.id
    const userId = req.params.id ? parseInt(req.params.id) : req.user.id;
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        data: null,
        message: 'User not found.' 
      });
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailTaken = await findUserByEmail(req.body.email);
      if (emailTaken && emailTaken.id !== userId) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Email is already in use.' 
        });
      }
    }

    const updates = {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
    };

    if (req.body.password) {
      if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).json({ 
          success: false,
          data: null,
          message: 'Password must be at least 6 characters.' 
        });
      }
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await updateUser(userId, updates);
    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserProfile,
  createNewUser,
  updateUserProfile,
};
