const express = require('express');
const { simulateDraw, publishDraw, getDraws } = require('../controllers/drawController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDraws);

// Admin
router.post('/simulate', protect, requireAdmin, simulateDraw);
router.post('/publish', protect, requireAdmin, publishDraw);

module.exports = router;
