const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // e.g. "2026-03"
    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length === 5,
        message: 'Draw must have exactly 5 numbers',
      },
    },
    type: { type: String, enum: ['random', 'weighted'], default: 'random' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    totalPool: { type: Number, default: 0 }, // Total prize pool in pence/cents
    winnersSummary: {
      match3: { type: Number, default: 0 },
      match4: { type: Number, default: 0 },
      match5: { type: Number, default: 0 },
    },
    jackpotRolledOver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);
