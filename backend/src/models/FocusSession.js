const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 8 hours (480 minutes)']
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Track if session was completed or cancelled
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
});

// Automatically calculate endAt based on duration if not provided
focusSessionSchema.pre('save', function(next) {
  if (!this.endAt && this.startedAt && this.duration) {
    this.endAt = new Date(this.startedAt.getTime() + this.duration * 60000);
  }
  next();
});

module.exports = mongoose.model('FocusSession', focusSessionSchema);
