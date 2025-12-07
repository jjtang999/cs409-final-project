const mongoose = require('mongoose');

const blockedWebsiteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    enum: ['Social Media', 'Entertainment', 'News', 'Shopping', 'Gaming', 'Other'],
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique URL per user
blockedWebsiteSchema.index({ user: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('BlockedWebsite', blockedWebsiteSchema);
