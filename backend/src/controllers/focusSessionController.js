const FocusSession = require('../models/FocusSession');

// @desc    Get all focus sessions for user
// @route   GET /api/focus-sessions
// @access  Private
exports.getFocusSessions = async (req, res, next) => {
  try {
    const { status, limit = 20 } = req.query;
    const query = { user: req.userId };

    if (status) {
      query.status = status;
    }

    const sessions = await FocusSession.find(query)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active focus session
// @route   GET /api/focus-sessions/active
// @access  Private
exports.getActiveFocusSession = async (req, res, next) => {
  try {
    const session = await FocusSession.findOne({
      user: req.userId,
      status: 'active'
    });

    if (!session) {
      return res.json({
        success: true,
        data: null
      });
    }

    // Check if session has expired
    if (new Date() > new Date(session.endAt)) {
      session.status = 'completed';
      session.completedAt = session.endAt;
      session.isActive = false;
      await session.save();

      return res.json({
        success: true,
        data: null,
        message: 'Previous session has ended'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a new focus session
// @route   POST /api/focus-sessions
// @access  Private
exports.startFocusSession = async (req, res, next) => {
  try {
    const { name, duration } = req.body;

    // Check for existing active session
    const existingSession = await FocusSession.findOne({
      user: req.userId,
      status: 'active'
    });

    if (existingSession) {
      // Check if it's actually still active
      if (new Date() < new Date(existingSession.endAt)) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active focus session'
        });
      } else {
        // Auto-complete expired session
        existingSession.status = 'completed';
        existingSession.completedAt = existingSession.endAt;
        existingSession.isActive = false;
        await existingSession.save();
      }
    }

    const startedAt = new Date();
    const endAt = new Date(startedAt.getTime() + duration * 60000);

    const session = await FocusSession.create({
      user: req.userId,
      name: name || 'Focus Session',
      duration,
      startedAt,
      endAt,
      isActive: true,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Focus session started',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End a focus session (complete or cancel)
// @route   PUT /api/focus-sessions/:id/end
// @access  Private
exports.endFocusSession = async (req, res, next) => {
  try {
    const { status = 'completed' } = req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Focus session not found'
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This session has already ended'
      });
    }

    session.status = status === 'cancelled' ? 'cancelled' : 'completed';
    session.completedAt = new Date();
    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: `Focus session ${session.status}`,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get focus session statistics
// @route   GET /api/focus-sessions/stats
// @access  Private
exports.getFocusSessionStats = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const sessions = await FocusSession.find({
      user: req.userId,
      startedAt: { $gte: startDate },
      status: 'completed'
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;

    res.json({
      success: true,
      data: {
        period,
        totalSessions,
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        averageDuration: Math.round(averageDuration)
      }
    });
  } catch (error) {
    next(error);
  }
};
