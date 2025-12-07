const express = require('express');
const router = express.Router();
const blockedWebsiteController = require('../controllers/blockedWebsiteController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', blockedWebsiteController.getBlockedWebsites);
router.post('/', blockedWebsiteController.addBlockedWebsite);
router.post('/bulk', blockedWebsiteController.bulkAddBlockedWebsites);
router.put('/:id', blockedWebsiteController.updateBlockedWebsite);
router.delete('/:id', blockedWebsiteController.deleteBlockedWebsite);

module.exports = router;
