const Score = require('../models/Score');

exports.addScore = async (req, res) => {
  const { value, date } = req.body;
  if (value < 1 || value > 45) {
    return res.status(400).json({ message: 'Score must be between 1 and 45' });
  }

  const doc = await Score.addScore(req.user._id, value, date);
  res.status(201).json(doc.scores);
};

exports.getScores = async (req, res) => {
  const doc = await Score.findOne({ userId: req.user._id });
  res.json(doc ? doc.scores : []);
};
