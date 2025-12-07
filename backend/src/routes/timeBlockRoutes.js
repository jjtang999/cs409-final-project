const express = require('express');
const router = express.Router();
const timeBlockController = require('../controllers/timeBlockController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', timeBlockController.getTimeBlocks);
router.get('/active-now', timeBlockController.getActiveTimeBlocks);
router.post('/', timeBlockController.createTimeBlock);
router.put('/:id', timeBlockController.updateTimeBlock);
router.patch('/:id/toggle', timeBlockController.toggleTimeBlock);
router.delete('/:id', timeBlockController.deleteTimeBlock);

module.exports = router;
