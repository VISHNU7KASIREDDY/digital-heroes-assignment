const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Charity = require('../models/Charity');

exports.getAnalytics = async (req, res) => {
  const usersCount = await User.countDocuments();
  const subsCount = await Subscription.countDocuments({ status: 'active' });
  const charitiesCount = await Charity.countDocuments();

  const charities = await Charity.find({}, 'name totalDonations');
  const totalDonated = charities.reduce((sum, c) => sum + c.totalDonations, 0);

  // Rough estimation of active pool. In reality we sum active Stripe prices.
  const poolEstimate = subsCount * 1000; // Assuming $10/mo sub => $10 pool roughly per sub for prizes? (Logic handles this via draw creation).

  res.json({
    usersCount,
    activeSubscriptions: subsCount,
    charitiesCount,
    totalDonated,
    totalPrizePoolEstimate: poolEstimate,
  });
};

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};
