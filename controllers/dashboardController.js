const User = require("../models/User");
const Attendance = require("../models/Attendance");
const AppUsage = require("../models/AppUsage");

/* ================= DASHBOARD SUMMARY API ================= */

exports.getDashboardSummary = async (req, res) => {

  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const totalUsers = await User.countDocuments();

    const todayAttendance = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lte: endToday
      }
    });

    const activeUsage = await AppUsage.countDocuments({
      date: {
        $gte: today,
        $lte: endToday
      }
    });

    res.json({
      success: true,
      totalUsers,
      todayAttendance,
      activeUsage
    });

  } catch (error) {

    console.error("Dashboard Summary Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};