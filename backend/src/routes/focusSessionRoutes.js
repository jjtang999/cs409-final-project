const express = require('express');
const router = express.Router();
const focusSessionController = require('../controllers/focusSessionController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', focusSessionController.getFocusSessions);
router.get('/active', focusSessionController.getActiveFocusSession);
router.get('/stats', focusSessionController.getFocusSessionStats);
router.post('/', focusSessionController.startFocusSession);
router.put('/:id/end', focusSessionController.endFocusSession);

module.exports = router;
