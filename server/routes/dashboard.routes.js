const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middleware/verifyToken');

router.get('/par', verifyToken, dashboardController.getParDashboard);
router.get('/daily-trend', verifyToken, dashboardController.getDailyTrend);

module.exports = router;
