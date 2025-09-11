const express = require('express');
const authController = require('../controllers/auth.Controller');
const authMiddleware = require('../middleware/auth.Middleware');
const { multermiddleware } = require('../config/cloudinaryConfig');

const router = express.Router();

router.get('/check-auth',authMiddleware,authController.checkAuth);

router.post('/send-otp',authController.sendOtp);
router.post('/verify-otp',authController.verifyOtp);
router.post('/logout',authController.logout);

router.put('/update-profile',authMiddleware,multermiddleware,authController.updateProfile);

module.exports = router;