# FairwayFund — Golf Charity Platform

A production-ready MERN stack application allowing users to log golf scores, participate in monthly weighted draws based on score frequency, and contribute at least 10% of their subscription to a charity of their choice.

## Features Built
- **Full Auth System**: JWT Access + Refresh Tokens, BCrypt, role-based protection
- **Stripe Subscriptions**: Monthly/Yearly checkout, webhooks for auto-status updates
- **Draw Engine**: Generates 5 Random or Community-Weighted numbers. Automatically simulates matches and calculates Prize Pools (40% Jackpot, 35% 4-match, 25% 3-match)
- **Score Logging**: Auto-trims to only keep the latest 5 scores per user.
- **Winnings Verification**: Integration with Cloudinary for users to upload proof scorecards.
- **Admin Dashboard**: Manage draws, view analytics, manage charities, approve/pay out winnings.
- **Modern UI**: React 18, Vite, Framer Motion, Tailwind CSS with an earthy, modern, non-cliché aesthetic.

## Folder Structure
```
Digital Heroes Assignment/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI pieces & layout
│   │   ├── context/     # Auth Context Provider
│   │   ├── hooks/       # React Query hooks
│   │   ├── pages/       # All views (Auth, Dashboard, Admin)
│   │   ├── services/    # Axios API setup with interceptors
│   │   ├── App.jsx      # Routing configuration
│   │   └── main.jsx     # Entry point
│   ├── tailwind.config.js
│   └── package.json
└── server/           # Node/Express Backend
    ├── config/       # Environment & setups
    ├── controllers/  # Route handlers
    ├── middleware/   # JWT Auth & Stripe Subscription guards
    ├── models/       # Mongoose schemas
    ├── routes/       # Express Router groupings
    ├── services/     # Core Business Logic (Razorpay, Cloudinary, Draw Algorithm)
    ├── index.js      # Server Entry Point
    └── package.json
```

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB instance (e.g., MongoDB Atlas)
- Stripe Account (Test mode keys)
- Cloudinary Account (Free tier is fine)

### 2. Backend Setup
1. Navigate to the `server` folder: `cd server`
2. Install dependencies: `npm install`
3. Copy the example `.env`: `cp .env.example .env`
4. Fill in the `.env` values (MongoDB URI, Razorpay Keys, Cloudinary Keys).
5. Start the backend: `npm start` (or `node index.js`)

### 3. Frontend Setup
1. Navigate to the `client` folder: `cd client`
2. Install dependencies: `npm install`
3. The frontend expects the backend on `http://localhost:5000/api` by default. If different, create a `.env` file in the client folder with `VITE_API_URL=http://your-backend/api`.
4. Start the dev server: `npm run dev`

### 4. Admin Access
To access the Admin Panel, create an account normally through the UI, then manually edit the MongoDB `User` document to set the `role` field from `"user"` to `"admin"`. Log out and log back in.

## Deployment Guide

### Database
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist IP `0.0.0.0/0` (for cloud deployment).
3. Get the Connection String and set it as `MONGO_URI` in your backend deployment.

### Backend (Render or Railway)
1. Push your code to GitHub.
2. Link the repository to Render/Railway.
3. Set the Root Directory to `server/`.
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Add all environment variables from your local `.env`.

### Frontend (Vercel)
1. Link your repository to Vercel.
2. Set the Framework Preset to `Vite`.
3. Set the Root Directory to `client/`.
4. Override the build command if needed (usually defaults to `npm run build`).
5. Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://my-backend.onrender.com/api`).
6. Deploy.

### Stripe Webhook Final Step
Once your backend is deployed, go to the Stripe Dashboard -> Developers -> Webhooks.
Click "Add Endpoint", enter your deployed backend URL: `https://YOUR_DOMAIN.com/api/subscriptions/webhook`.
Select events like `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
Enter the Secret and set it as `STRIPE_WEBHOOK_SECRET` in your backend environment variables.
