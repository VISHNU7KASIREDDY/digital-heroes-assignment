const Charity = require('../models/Charity');

exports.getCharities = async (req, res) => {
  const charities = await Charity.find({ isActive: true });
  res.json(charities);
};

// Admin
exports.createCharity = async (req, res) => {
  const { name, description, image, imagePublicId } = req.body;
  const charity = await Charity.create({ name, description, image, imagePublicId });
  res.status(201).json(charity);
};

exports.updateCharity = async (req, res) => {
  const up = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(up);
};

exports.deleteCharity = async (req, res) => {
  await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Charity deactivated' });
};
