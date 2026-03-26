const express = require('express');
const multer = require('multer');
const { getMyWinnings, getAllWinnings, uploadProof, updateWinningStatus } = require('../controllers/winningController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // hold in buffer for Cloudinary

router.get('/me', protect, getMyWinnings);
router.post('/:id/proof', protect, upload.single('proof'), uploadProof);

// Admin
router.get('/admin', protect, requireAdmin, getAllWinnings);
router.put('/:id/status', protect, requireAdmin, updateWinningStatus);

module.exports = router;
