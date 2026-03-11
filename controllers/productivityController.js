const AppUsage = require("../models/AppUsage");

/*
Productivity Score Logic (Simple Version)

You can later upgrade to ML-based scoring.
*/

const PRODUCTIVE_APPS = [
  "Visual Studio",
  "VS Code",
  "IntelliJ",
  "Eclipse",
  "ChatGPT",
  "Chrome"
];

exports.getProductivityScore = async (req, res) => {

  try {

    const { userId } = req.params;

    const usages = await AppUsage.find({
      userId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    let totalTime = 0;
    let productiveTime = 0;

    usages.forEach(app => {

      totalTime += app.duration;

      if (PRODUCTIVE_APPS.includes(app.appName)) {
        productiveTime += app.duration;
      }

    });

    const score = totalTime === 0
      ? 0
      : ((productiveTime / totalTime) * 100).toFixed(2);

    res.json({
      productivityScore: score
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = exports;