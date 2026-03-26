const express = require('express');
const { getCharities, createCharity, updateCharity, deleteCharity } = require('../controllers/charityController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCharities);

// Admin
router.post('/', protect, requireAdmin, createCharity);
router.put('/:id', protect, requireAdmin, updateCharity);
router.delete('/:id', protect, requireAdmin, deleteCharity);

module.exports = router;
