const mongoose = require('mongoose');

const timeBlockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Time block name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  startTime: {
    type: String, // HH:MM format
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  endTime: {
    type: String, // HH:MM format
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  daysOfWeek: {
    type: [Number], // 0 = Sunday, 1 = Monday, etc.
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0 && arr.every(day => day >= 0 && day <= 6);
      },
      message: 'Please select at least one valid day (0-6)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
timeBlockSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TimeBlock', timeBlockSchema);
