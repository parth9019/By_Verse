const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ================= AUTH =================
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);

// ================= OTP =================
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);

// ================= SECURITY =================
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
