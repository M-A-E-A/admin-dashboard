const express = require('express');
const { getAllUsers, getUserById, getUserProfile, createNewUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllUsers);
router.post('/', protect, createNewUser);
router.get('/profile/me', protect, getUserProfile);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUserProfile);

module.exports = router;
