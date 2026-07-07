const express = require('express');
const { getStats, getRecentActivity, getTrends } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/recent-activity', getRecentActivity);
router.get('/trends', getTrends);

module.exports = router;
