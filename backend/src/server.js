require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware');
const {
  authRoutes,
  blockedWebsiteRoutes,
  timeBlockRoutes,
  focusSessionRoutes
} = require('./routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Focus Guard API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blocked-websites', blockedWebsiteRoutes);
app.use('/api/time-blocks', timeBlockRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);

// Extension-specific endpoint - get blocking status for current user
app.get('/api/extension/status', require('./middleware/auth'), async (req, res) => {
  try {
    const BlockedWebsite = require('./models/BlockedWebsite');
    const TimeBlock = require('./models/TimeBlock');
    const FocusSession = require('./models/FocusSession');

    // Get active focus session
    const activeSession = await FocusSession.findOne({
      user: req.userId,
      status: 'active',
      endAt: { $gt: new Date() }
    });

    // Get blocked websites
    const blockedWebsites = await BlockedWebsite.find({
      user: req.userId,
      isActive: true
    });

    // Check if current time is within any active time block
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const activeTimeBlocks = await TimeBlock.find({
      user: req.userId,
      isActive: true,
      daysOfWeek: currentDay
    });

    const isInTimeBlock = activeTimeBlocks.some(block => 
      currentTime >= block.startTime && currentTime <= block.endTime
    );

    const shouldBlock = activeSession !== null || isInTimeBlock;

    res.json({
      success: true,
      data: {
        shouldBlock,
        blockedUrls: blockedWebsites.map(w => w.url),
        activeFocusSession: activeSession ? {
          name: activeSession.name,
          endAt: activeSession.endAt
        } : null,
        isInTimeBlock
      }
    });
  } catch (error) {
    console.error('Extension status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
