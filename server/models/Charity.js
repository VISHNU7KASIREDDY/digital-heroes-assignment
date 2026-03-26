const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' }, // Cloudinary URL
    imagePublicId: { type: String, default: '' },
    totalDonations: { type: Number, default: 0 }, // cumulative in cents
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Charity', charitySchema);
