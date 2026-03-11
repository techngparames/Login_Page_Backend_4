const AppUsage = require("../models/AppUsage");
const mongoose = require("mongoose");

/* ================= POST APP USAGE ================= */
const trackAppUsage = async (req, res) => {
  try {
    const { userId, appName, activeMinutes, idleMinutes, totalMinutes } = req.body;

    // Validate input
    if (!userId || !appName || activeMinutes === undefined || idleMinutes === undefined || totalMinutes === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Save app usage
    const newUsage = new AppUsage({
      userId,
      appName,
      activeMinutes,
      idleMinutes,
      totalMinutes,
      date: new Date(),
    });

    await newUsage.save();

    res.status(201).json({ message: "App usage recorded successfully" });
  } catch (error) {
    console.error("trackAppUsage Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= HOURLY APP USAGE ================= */
const getHourlyAppUsage = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const hourlyData = await AppUsage.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(userId), date: { $gte: startOfDay, $lte: endOfDay } }
      },
      {
        $project: {
          appName: 1,
          activeMinutes: 1,
          idleMinutes: 1,
          hour: { $hour: "$date" }
        }
      },
      {
        $group: {
          _id: { appName: "$appName", hour: "$hour" },
          activeMinutes: { $sum: "$activeMinutes" },
          idleMinutes: { $sum: "$idleMinutes" },
        }
      },
      { $sort: { "_id.hour": 1, "_id.appName": 1 } }
    ]);

    res.json(hourlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= DAILY APP USAGE ================= */
const getDailyReport = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyData = await AppUsage.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$appName",
          activeMinutes: { $sum: "$activeMinutes" },
          idleMinutes: { $sum: "$idleMinutes" },
          totalMinutes: { $sum: "$totalMinutes" },
        },
      },
      { $sort: { totalMinutes: -1 } },
    ]);

    res.json(dailyData);
  } catch (err) {
    console.error("getDailyReport Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= MONTHLY APP USAGE ================= */
const getMonthlyReport = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyData = await AppUsage.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$appName",
          activeMinutes: { $sum: "$activeMinutes" },
          idleMinutes: { $sum: "$idleMinutes" },
          totalMinutes: { $sum: "$totalMinutes" },
        },
      },
      { $sort: { totalMinutes: -1 } },
    ]);

    res.json(monthlyData);
  } catch (err) {
    console.error("getMonthlyReport Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= EXPORT CONTROLLERS ================= */
module.exports = {
  trackAppUsage,
  getDailyReport,
  getMonthlyReport,
  getHourlyAppUsage, // new
};