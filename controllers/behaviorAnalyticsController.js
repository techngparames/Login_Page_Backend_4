const AppUsage = require("../models/AppUsage");

/*
Simple Behavioral Intelligence Signal Generator
*/

exports.getBehaviorSignal = async (req, res) => {

  try {

    const { userId } = req.params;

    const usages = await AppUsage.find({
      userId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    let totalDuration = 0;

    usages.forEach(app => {
      totalDuration += app.duration;
    });

    let signal = "NORMAL";

    if (totalDuration < 600) {
      signal = "LOW_ACTIVITY";
    }

    if (totalDuration < 300) {
      signal = "VERY_LOW_ACTIVITY";
    }

    res.json({
      signal,
      totalDuration
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = exports;