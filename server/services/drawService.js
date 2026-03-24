const Score = require('../models/Score');

/**
 * DRAW SERVICE — Core draw engine
 *
 * Generates 5 unique numbers (1–45).
 *
 * TWO MODES:
 *
 * 1. RANDOM: Pure random selection (equal probability per number)
 *
 * 2. WEIGHTED:
 *    - Aggregate all users' last-5 score values into a frequency map
 *    - Numbers that appear more frequently in recent user scores get
 *      slightly higher draw weight (by a configurable bias factor)
 *    - This creates a "community-influenced" draw that is still fair
 *      but biased toward numbers the community has been playing
 */

/** Generate 5 unique random numbers from 1–45 */
const generateRandom = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...numbers];
};

/**
 * Build a frequency map of all score values across all users
 */
const buildFrequencyMap = async () => {
  const allScores = await Score.find({}, 'scores.value');
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 1; // base weight = 1

  for (const doc of allScores) {
    for (const s of doc.scores) {
      if (s.value >= 1 && s.value <= 45) {
        freq[s.value] = (freq[s.value] || 1) + 2; // bias factor = 2x
      }
    }
  }
  return freq;
};

/**
 * Weighted random selection without replacement.
 * Uses cumulative probability (roulette wheel selection).
 */
const weightedSample = (freq, count = 5) => {
  const pool = Object.entries(freq).map(([num, w]) => ({ num: parseInt(num), w }));
  const selected = [];

  while (selected.size !== count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, e) => sum + e.w, 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    while (rand > 0 && idx < pool.length) {
      rand -= pool[idx].w;
      if (rand <= 0) break;
      idx++;
    }
    idx = Math.min(idx, pool.length - 1);
    const picked = pool.splice(idx, 1)[0];
    if (!selected.includes(picked.num)) selected.push(picked.num);
  }

  // Fallback: fill remaining with random if needed
  while (selected.length < count) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!selected.includes(n)) selected.push(n);
  }

  return selected;
};

/** Generate draw numbers in the specified mode */
const generateNumbers = async (type = 'random') => {
  if (type === 'weighted') {
    const freq = await buildFrequencyMap();
    return weightedSample(freq, 5);
  }
  return generateRandom();
};

/**
 * MATCH LOGIC
 * Compare a user's scores array (values) against drawn numbers.
 * Returns the count of matching numbers (0–5).
 *
 * @param {number[]} userScores - Last 5 score values for a user
 * @param {number[]} drawnNumbers - 5 drawn numbers
 */
const countMatches = (userScores, drawnNumbers) => {
  const drawn = new Set(drawnNumbers);
  return userScores.filter((v) => drawn.has(v)).length;
};

/**
 * PRIZE POOL SPLIT
 *
 * Distribution:
 *   5 match → 40% (jackpot; rolls over if no winner)
 *   4 match → 35%
 *   3 match → 25%
 *
 * Equal split among winners of same tier.
 * Jackpot rolls over if no 5-match winner (cumulative across draws).
 *
 * @param {number} totalPool  - total pool in cents
 * @param {{ match3: User[], match4: User[], match5: User[] }} winnerGroups
 * @param {number} rolledOverJackpot - accumulated jackpot from prev draws (cents)
 */
const calculatePrizes = (totalPool, winnerGroups, rolledOverJackpot = 0) => {
  const jackpotPool = Math.floor(totalPool * 0.4) + rolledOverJackpot;
  const match4Pool = Math.floor(totalPool * 0.35);
  const match3Pool = Math.floor(totalPool * 0.25);

  const result = {
    jackpotRolledOver: false,
    rolledOverAmount: 0,
    payouts: {
      match5: jackpotPool,       // total for all 5-match winners
      match4: match4Pool,
      match3: match3Pool,
    },
    perWinner: {
      match5: 0,
      match4: 0,
      match3: 0,
    },
  };

  // 5 match
  if (winnerGroups.match5.length > 0) {
    result.perWinner.match5 = Math.floor(jackpotPool / winnerGroups.match5.length);
  } else {
    result.jackpotRolledOver = true;
    result.rolledOverAmount = jackpotPool;
  }

  // 4 match
  if (winnerGroups.match4.length > 0) {
    result.perWinner.match4 = Math.floor(match4Pool / winnerGroups.match4.length);
  }

  // 3 match
  if (winnerGroups.match3.length > 0) {
    result.perWinner.match3 = Math.floor(match3Pool / winnerGroups.match3.length);
  }

  return result;
};

/**
 * FIND ALL WINNERS for a draw
 * Pulls all active subscriber scores, matches against drawn numbers.
 *
 * @param {number[]} drawnNumbers
 * @returns {{ match3: [{userId}], match4: [{userId}], match5: [{userId}] }}
 */
const findWinners = async (drawnNumbers) => {
  const allScores = await Score.find().populate('userId', 'subscriptionStatus');

  const groups = { match3: [], match4: [], match5: [] };

  for (const scoreDoc of allScores) {
    // Only active subscribers participate in draws
    if (!scoreDoc.userId || scoreDoc.userId.subscriptionStatus !== 'active') continue;

    const values = scoreDoc.scores.map((s) => s.value);
    const matchCount = countMatches(values, drawnNumbers);

    if (matchCount === 3) groups.match3.push({ userId: scoreDoc.userId._id });
    else if (matchCount === 4) groups.match4.push({ userId: scoreDoc.userId._id });
    else if (matchCount === 5) groups.match5.push({ userId: scoreDoc.userId._id });
  }

  return groups;
};

module.exports = { generateNumbers, countMatches, calculatePrizes, findWinners };
