const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, { expiresIn });
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateToken(user._id, process.env.JWT_SECRET, process.env.ACCESS_TOKEN_EXPIRE);
  const refreshToken = generateToken(user._id, process.env.JWT_REFRESH_SECRET, process.env.REFRESH_TOKEN_EXPIRE);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    user,
    accessToken,
  });
};

exports.register = async (req, res) => {
  const { name, email, password, charityId, charityPercentage } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, charityId, charityPercentage });
  sendTokenResponse(user, 201, res);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Token invalid' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
};

exports.logout = (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateCharity = async (req, res) => {
  const { charityId } = req.body;
  if (!charityId) return res.status(400).json({ message: 'charityId required' });
  const user = await User.findByIdAndUpdate(req.user._id, { charityId }, { new: true });
  res.json({ user });
};

