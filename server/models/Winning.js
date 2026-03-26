const mongoose = require('mongoose');

const winningSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
    matchCount: { type: Number, enum: [3, 4, 5], required: true },
    amount: { type: Number, required: true }, // in cents/pence
    status: { type: String, enum: ['pending', 'approved', 'paid', 'rejected'], default: 'pending' },
    proofUrl: { type: String, default: null },
    proofPublicId: { type: String, default: null }, // Cloudinary public_id for deletion
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winning', winningSchema);
