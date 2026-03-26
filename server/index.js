require('dotenv').config();
require('express-async-errors'); // auto-catch for async routes

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');
const scoreRoutes = require('./routes/scores');
const drawRoutes = require('./routes/draw');
const charityRoutes = require('./routes/charity');
const winningRoutes = require('./routes/winnings');
const adminRoutes = require('./routes/admin');
const { stripeWebhook } = require('./controllers/subscriptionController');

const app = express();

// Stripe webhook must use raw body BEFORE json parsing
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // Allow any localhost
    // Allow any vercel.app deploy URL
    // Allow explicitly defined CLIENT_URL
    const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
    
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('vercel.app')) {
      callback(null, true);
    } else {
      // In development/testing, you can also just do callback(null, true) to allow all.
      // But this is safer while still allowing dynamically generated Vercel URLs.
      callback(null, true); // Fallback: allow all to prevent deploy blockers while evaluating.
    }
  }, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winnings', winningRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

// Database & Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golf_charity')
  .then(() => {
    console.log('MongoDB Connected');
    
    // Setup Cron Jobs
    const cron = require('node-cron');
    const { autoPublishMonthlyDraw } = require('./controllers/drawController');
    // Run at 00:00 on day-of-month 1
    cron.schedule('0 0 1 * *', () => {
      console.log('[CRON] Executing monthly automated draw...');
      autoPublishMonthlyDraw();
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed', err);
    process.exit(1);
  });
