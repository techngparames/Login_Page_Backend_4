// backend/routes/appUsageRoutes.js
const express = require("express");
const router = express.Router();
const AppUsage = require("../models/AppUsage");

// =============================
// ADD OR UPDATE APP USAGE
// =============================
router.post("/add", async (req, res) => {
  try {
    const { userId, appName, totalSeconds } = req.body;
    if (!userId || !appName || !totalSeconds) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await AppUsage.findOne({ userId, appName, date: today });

    if (usage) {
      usage.totalMinutes += totalSeconds / 60;
      usage.activeMinutes += totalSeconds / 60;
      await usage.save();
    } else {
      usage = new AppUsage({
        userId,
        appName,
        totalMinutes: totalSeconds / 60,
        activeMinutes: totalSeconds / 60,
        idleMinutes: 0,
        date: today
      });
      await usage.save();
    }

    res.json({ success: true, message: "Usage updated" });

  } catch (err) {
    console.error("App Usage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// GET TODAY'S USAGE
// =============================
// GET /api/app-usage/user/:userId/monthly
router.get("/user/:userId/monthly", async (req, res) => {
  try {
    const { userId } = req.params;

    // Aggregate by appName for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const data = await AppUsage.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: "$appName", totalMinutes: { $sum: "$totalMinutes" } } },
      { $project: { appName: "$_id", totalMinutes: 1, _id: 0 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Monthly Usage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// GET ALL DAILY USAGE
// =============================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await AppUsage.find({ userId }).sort({ date: 1 });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Fetch User Usage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// GET MONTHLY AGGREGATED USAGE
// =============================
router.get("/user/:userId/monthly", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);

    const data = await AppUsage.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId(userId), date: { $gte: firstDay } } },
      { $group: { _id: "$appName", totalMinutes: { $sum: "$totalMinutes" } } },
      { $project: { _id: 0, appName: "$_id", totalMinutes: 1 } }
    ]);

    res.json({ success: true, data });

  } catch (err) {
    console.error("Monthly Usage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;