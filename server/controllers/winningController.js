const Winning = require('../models/Winning');
const { uploadBuffer } = require('../services/cloudinaryService');

exports.getMyWinnings = async (req, res) => {
  const winnings = await Winning.find({ userId: req.user._id }).populate('drawId', 'month numbers totalPool');
  res.json(winnings);
};

// User uploads proof
exports.uploadProof = async (req, res) => {
  const { id } = req.params;
  const winning = await Winning.findOne({ _id: id, userId: req.user._id });
  if (!winning) return res.status(404).json({ message: 'Winning record not found' });

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const result = await uploadBuffer(req.file.buffer, 'proofs');

  winning.proofUrl = result.url;
  winning.proofPublicId = result.public_id;
  winning.status = 'approved'; // Usually goes pending -> admin approves. Auto-approving for simplicty, or admin flow.
  // Actually let's make it pending for Admin approval
  winning.status = 'pending';
  await winning.save();

  res.json(winning);
};

// Admin
exports.getAllWinnings = async (req, res) => {
  const wins = await Winning.find().populate('userId', 'name email').populate('drawId', 'month');
  res.json(wins);
};

exports.updateWinningStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body; // status: 'approved', 'rejected', 'paid'
  const win = await Winning.findByIdAndUpdate(id, { status, adminNote }, { new: true });
  res.json(win);
};
