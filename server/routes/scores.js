const express = require('express');
const { addScore, getScores } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');
const requireActiveSubscription = require('../middleware/requireActiveSubscription');

const router = express.Router();

router.post('/', protect, requireActiveSubscription, addScore);
router.get('/', protect, requireActiveSubscription, getScores);

module.exports = router;
