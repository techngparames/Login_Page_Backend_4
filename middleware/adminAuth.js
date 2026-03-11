const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    const { userId } = req.body; // for now, from request body

    const user = await User.findOne({ userId });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = adminAuth;