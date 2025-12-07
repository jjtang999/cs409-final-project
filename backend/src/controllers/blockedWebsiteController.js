const BlockedWebsite = require('../models/BlockedWebsite');

// @desc    Get all blocked websites for user
// @route   GET /api/blocked-websites
// @access  Private
exports.getBlockedWebsites = async (req, res, next) => {
  try {
    const websites = await BlockedWebsite.find({ user: req.userId })
      .sort({ addedAt: -1 });

    res.json({
      success: true,
      count: websites.length,
      data: websites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a blocked website
// @route   POST /api/blocked-websites
// @access  Private
exports.addBlockedWebsite = async (req, res, next) => {
  try {
    const { url, category } = req.body;

    // Clean and normalize URL
    const cleanUrl = url.trim().toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '');

    // Check for existing
    const existing = await BlockedWebsite.findOne({
      user: req.userId,
      url: cleanUrl
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This website is already in your blocked list'
      });
    }

    const website = await BlockedWebsite.create({
      user: req.userId,
      url: cleanUrl,
      category: category || 'Other'
    });

    res.status(201).json({
      success: true,
      message: 'Website added to blocked list',
      data: website
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blocked website
// @route   PUT /api/blocked-websites/:id
// @access  Private
exports.updateBlockedWebsite = async (req, res, next) => {
  try {
    const { category, isActive } = req.body;
    const updateData = {};

    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const website = await BlockedWebsite.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: website
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blocked website
// @route   DELETE /api/blocked-websites/:id
// @access  Private
exports.deleteBlockedWebsite = async (req, res, next) => {
  try {
    const website = await BlockedWebsite.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      message: 'Website removed from blocked list'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk add blocked websites
// @route   POST /api/blocked-websites/bulk
// @access  Private
exports.bulkAddBlockedWebsites = async (req, res, next) => {
  try {
    const { websites } = req.body;

    if (!Array.isArray(websites) || websites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of websites'
      });
    }

    const results = {
      added: [],
      skipped: []
    };

    for (const site of websites) {
      const cleanUrl = site.url.trim().toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, '');

      const existing = await BlockedWebsite.findOne({
        user: req.userId,
        url: cleanUrl
      });

      if (existing) {
        results.skipped.push(cleanUrl);
      } else {
        const newSite = await BlockedWebsite.create({
          user: req.userId,
          url: cleanUrl,
          category: site.category || 'Other'
        });
        results.added.push(newSite);
      }
    }

    res.status(201).json({
      success: true,
      message: `Added ${results.added.length} websites, skipped ${results.skipped.length} duplicates`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
