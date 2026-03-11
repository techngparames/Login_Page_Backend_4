const AppUsage = require("../models/AppUsage");

/*
Simple Behavior Prediction Engine

This is academic-level AI demonstration logic.
*/

exports.getRiskPrediction = async (req, res) => {

  try {

    const { userId } = req.params;

    const usages = await AppUsage.find({
      userId,
      date: {
        $gte: new Date(new Date().setHours(0,0,0,0))
      }
    });

    let totalTime = 0;

    usages.forEach(app => {
      totalTime += Number(app.duration || 0);
    });

    let prediction = "NORMAL";

    if (totalTime < 300) {
      prediction = "HIGH_RISK_LOW_ACTIVITY";
    }

    if (totalTime < 120) {
      prediction = "CRITICAL_INACTIVE";
    }

    res.json({
      prediction,
      totalActiveSeconds: totalTime
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = exports;