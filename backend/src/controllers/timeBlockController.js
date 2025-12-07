const TimeBlock = require('../models/TimeBlock');

// @desc    Get all time blocks for user
// @route   GET /api/time-blocks
// @access  Private
exports.getTimeBlocks = async (req, res, next) => {
  try {
    const timeBlocks = await TimeBlock.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: timeBlocks.length,
      data: timeBlocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a time block
// @route   POST /api/time-blocks
// @access  Private
exports.createTimeBlock = async (req, res, next) => {
  try {
    const { name, startTime, endTime, daysOfWeek, isActive } = req.body;

    const timeBlock = await TimeBlock.create({
      user: req.userId,
      name,
      startTime,
      endTime,
      daysOfWeek,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Time block created successfully',
      data: timeBlock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a time block
// @route   PUT /api/time-blocks/:id
// @access  Private
exports.updateTimeBlock = async (req, res, next) => {
  try {
    const { name, startTime, endTime, daysOfWeek, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek;
    if (isActive !== undefined) updateData.isActive = isActive;

    const timeBlock = await TimeBlock.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    res.json({
      success: true,
      message: 'Time block updated successfully',
      data: timeBlock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a time block
// @route   DELETE /api/time-blocks/:id
// @access  Private
exports.deleteTimeBlock = async (req, res, next) => {
  try {
    const timeBlock = await TimeBlock.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    res.json({
      success: true,
      message: 'Time block deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle time block active status
// @route   PATCH /api/time-blocks/:id/toggle
// @access  Private
exports.toggleTimeBlock = async (req, res, next) => {
  try {
    const timeBlock = await TimeBlock.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    timeBlock.isActive = !timeBlock.isActive;
    await timeBlock.save();

    res.json({
      success: true,
      message: `Time block ${timeBlock.isActive ? 'activated' : 'deactivated'}`,
      data: timeBlock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active time blocks for current time
// @route   GET /api/time-blocks/active-now
// @access  Private
exports.getActiveTimeBlocks = async (req, res, next) => {
  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const timeBlocks = await TimeBlock.find({
      user: req.userId,
      isActive: true,
      daysOfWeek: currentDay
    });

    // Filter to those where current time is within the time block
    const activeNow = timeBlocks.filter(block => {
      return currentTime >= block.startTime && currentTime <= block.endTime;
    });

    res.json({
      success: true,
      count: activeNow.length,
      data: activeNow
    });
  } catch (error) {
    next(error);
  }
};
