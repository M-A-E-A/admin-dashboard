const express = require('express');
const { registerUser, loginUser, resetPassword, getCurrentUser } = require('../controllers/authController_new');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getCurrentUser);

module.exports = router;
