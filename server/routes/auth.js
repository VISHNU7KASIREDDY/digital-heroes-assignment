const express = require('express');
const { register, login, refresh, logout, getMe, updateCharity } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me/charity', protect, updateCharity);

module.exports = router;
