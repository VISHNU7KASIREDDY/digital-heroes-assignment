const Draw = require('../models/Draw');
const Winning = require('../models/Winning');
const Score = require('../models/Score');
const User = require('../models/User');
const { generateNumbers, countMatches, calculatePrizes, findWinners } = require('../services/drawService');

// ADMIN ONLY

/**
 * Run a simulation or actual draft of a draw. Does not publish or assign real money yet.
 */
exports.simulateDraw = async (req, res) => {
  const { month, type, expectedTotalPool } = req.body;

  if (!month) return res.status(400).json({ message: 'Month string required (e.g. "2026-03")' });

  // Generate numbers
  const numbers = await generateNumbers(type || 'random');

  // Find simulated winners
  const winners = await findWinners(numbers);

  // Grab rolled over pool from the most recent draw (if it had no 5-match winner)
  const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
  const rolledOverAmount = lastDraw && lastDraw.jackpotRolledOver ? Math.floor(lastDraw.totalPool * 0.4) : 0; // rough simulation

  // Calculate prize splits
  // using 100000 cents ($1000) as default fallback for testing if no pool specified
  const totalPool = expectedTotalPool || 100000;
  const prizes = calculatePrizes(totalPool, winners, rolledOverAmount);

  res.json({
    numbers,
    type: type || 'random',
    winnersSummary: {
      match3: winners.match3.length,
      match4: winners.match4.length,
      match5: winners.match5.length,
    },
    prizes,
  });
};

/**
 * Officially save a draw and generate winning records.
 */
exports.publishDraw = async (req, res) => {
  const { month, numbers, type, totalPool } = req.body;

  const existingDraw = await Draw.findOne({ month });
  if (existingDraw) return res.status(400).json({ message: 'Draw already exists for this month.' });

  // 1. Find winners
  const winnersGroup = await findWinners(numbers);

  // 2. Compute rollover
  const lastDraw = await Draw.findOne().sort({ createdAt: -1 });
  let rolledOverAmount = 0;
  if (lastDraw && lastDraw.jackpotRolledOver) {
    // simplified: previous total pool * 0.4, or fetch exact unawarded amount if stored
    rolledOverAmount = Math.floor(lastDraw.totalPool * 0.4);
  }

  // 3. Compute Prizes
  const prizes = calculatePrizes(totalPool, winnersGroup, rolledOverAmount);

  // 4. Create Draw record
  const draw = await Draw.create({
    month,
    numbers,
    type,
    status: 'published',
    totalPool,
    winnersSummary: {
      match3: winnersGroup.match3.length,
      match4: winnersGroup.match4.length,
      match5: winnersGroup.match5.length,
    },
    jackpotRolledOver: prizes.jackpotRolledOver,
  });

  // 5. Create Winning records
  const winningDocs = [];

  const addDocs = (groupArray, matchCount, amount) => {
    groupArray.forEach((w) => {
      winningDocs.push({
        userId: w.userId,
        drawId: draw._id,
        matchCount,
        amount,
        status: 'pending',
      });
    });
  };

  if (prizes.perWinner.match3 > 0) addDocs(winnersGroup.match3, 3, prizes.perWinner.match3);
  if (prizes.perWinner.match4 > 0) addDocs(winnersGroup.match4, 4, prizes.perWinner.match4);
  if (prizes.perWinner.match5 > 0) addDocs(winnersGroup.match5, 5, prizes.perWinner.match5);

  if (winningDocs.length > 0) {
    await Winning.insertMany(winningDocs);
  }

  res.status(201).json({ message: 'Draw published and winnings distributed', draw });
};

/** List all draws */
exports.getDraws = async (req, res) => {
  const draws = await Draw.find().sort({ createdAt: -1 });
  res.json(draws);
};
