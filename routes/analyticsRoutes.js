const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// POST app usage
router.post("/", analyticsController.trackAppUsage);

// GET daily and monthly reports by userId
router.get("/daily/:userId", analyticsController.getDailyReport);
router.get("/monthly/:userId", analyticsController.getMonthlyReport);
router.get("/hourly/:userId", analyticsController.getHourlyAppUsage);

module.exports = router;