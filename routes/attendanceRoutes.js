const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// =====================================
// MARK ATTENDANCE (First Login of Day)
// =====================================
router.post("/mark", async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    // 🔥 Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 Check if already marked today
    const existing = await Attendance.findOne({
      userId,
      date: today
    });

    if (existing) {
      return res.json({
        success: true,
        alreadyMarked: true,
        message: "Today's attendance already marked"
      });
    }

    // 🔥 Create new attendance
    const newAttendance = new Attendance({
      userId,
      date: today,
      loginTime: new Date(),   // 🔥 First login time
      status: "Present",
      location: location || null
    });

    await newAttendance.save();

    res.json({
      success: true,
      alreadyMarked: false,
      message: "Today's attendance marked successfully"
    });

  } catch (err) {
    console.error("Attendance Mark Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =====================================
// LOGOUT (Update logoutTime)
// =====================================
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance found for today"
      });
    }

    attendance.logoutTime = new Date();
    await attendance.save();

    res.json({
      success: true,
      message: "Logout time updated successfully"
    });

  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =====================================
// GET ATTENDANCE BY USER
// =====================================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await Attendance.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      data: records
    });

  } catch (err) {
    console.error("Fetch Attendance Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;