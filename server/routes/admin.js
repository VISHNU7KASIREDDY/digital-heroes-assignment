const express = require('express');
const { getAnalytics, getUsers } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/analytics', protect, requireAdmin, getAnalytics);
router.get('/users', protect, requireAdmin, getUsers);

module.exports = router;
