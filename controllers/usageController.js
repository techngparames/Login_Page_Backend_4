// usageController.js
// Purpose: Track application usage per user
// Functions include:
// - getUsageData(): Returns daily/monthly app usage
// - (Later) recordAppUsage(): Save real-time usage to MongoDB


// controllers/usageController.js
exports.getUsageData = (req, res) => {
  res.json({
    message: "Usage API working successfully"
  });
};