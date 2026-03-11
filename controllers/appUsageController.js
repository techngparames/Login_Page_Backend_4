const mongoose = require("mongoose");
const AppUsage = require("../models/AppUsage");

/**
 * Get Application Usage Analytics (Pie Chart Format)
 */

exports.getAppUsage = async (req, res) => {

  try {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID"
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    /* ================= TODAY FILTER ================= */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    /* ================= AGGREGATION PIPELINE ================= */

    const apps = await AppUsage.aggregate([
      {
        $match: {
          userId: objectId,
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: "$appName",
          totalDuration: {
            $sum: {
              $toDouble: "$duration"
            }
          }
        }
      }
    ]);

    if (!apps || apps.length === 0) {
      return res.json([]);
    }

    /* ================= TOTAL TIME CALCULATION ================= */

    const totalTime = apps.reduce(
      (sum, app) => sum + (app.totalDuration || 0),
      0
    );

    if (totalTime <= 0) {
      return res.json([]);
    }

    /* ================= RESPONSE FORMAT ================= */

    const result = apps.map(app => ({
      name: app._id || "App",
      percentage: Number(
        ((app.totalDuration || 0) / totalTime * 100).toFixed(2)
      )
    }));

    return res.json(result);

  } catch (error) {

    console.error("App Usage Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};
module.exports = {
  getAppUsage: exports.getAppUsage
};