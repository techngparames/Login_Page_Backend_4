const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Get daily app usage
// Example: GET /api/analytics/daily-report?userId=123&date=2026-02-27
router.get("/daily-report", analyticsController.getDailyReport);

// Get monthly app usage
// Example: GET /api/analytics/monthly-report?userId=123&month=2&year=2026
router.get("/monthly-report", analyticsController.getMonthlyReport);

module.exports = router;