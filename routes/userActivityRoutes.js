const express = require("express");
const router = express.Router();
const AppUsage = require("../models/AppUsage"); // Assuming this model exists

// GET all user activity
router.get("/", async (req, res) => {
  try {
    const activities = await AppUsage.find().sort({ date: -1 }); // latest first
    res.json({ success: true, data: activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;