const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  date: { type: Date, required: true, default: Date.now },
});

const scoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    scores: {
      type: [scoreEntrySchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A user can only have up to 5 scores stored',
      },
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * Static: add a score to a user, keeping only the latest 5.
 * If the user document doesn't exist yet, create it.
 */
scoreSchema.statics.addScore = async function (userId, value, date) {
  const doc = await this.findOneAndUpdate(
    { userId },
    {
      $push: {
        scores: {
          $each: [{ value, date: date || new Date() }],
          $sort: { date: -1 }, // newest first
          $slice: 5,            // keep only 5
        },
      },
    },
    { upsert: true, new: true }
  );
  return doc;
};

module.exports = mongoose.model('Score', scoreSchema);
