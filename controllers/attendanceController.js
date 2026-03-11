// attendanceController.js
// Purpose: Track attendance details
// Functions include:
// - logLogin()
// - logLogout()
// - calculateActiveIdleTime()


// backend/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const User = require("../models/User");

/* ================= CONFIG ================= */

const THRESHOLD = 0.5;

/* ================= Helper ================= */

const getTodayDate = () =>
  new Date().toISOString().split("T")[0];

/* Distance Calculator */

const calculateDistance = (d1 = [], d2 = []) => {

  let sum = 0;

  for (let i = 0; i < 128; i++) {
    sum += Math.pow((d1[i] || 0) - (d2[i] || 0), 2);
  }

  return Math.sqrt(sum);
};

/* ================= LOGIN ================= */

const loginUser = async (req, res) => {

  try {

    let { faceDescriptor, name, email, location } = req.body;

    if (!Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid face descriptor"
      });
    }

    const descriptor = faceDescriptor.map(Number);

    if (descriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor must be 128 length"
      });
    }

    /* Find Registered Users */

    const users = await User.find({
      faceDescriptor: { $exists: true, $ne: [] }
    });

    let matchedUser = null;
    let minDistance = Infinity;

    for (const user of users) {

      if (!user.faceDescriptor ||
          user.faceDescriptor.length !== 128)
        continue;

      const distance = calculateDistance(
        user.faceDescriptor,
        descriptor
      );

      if (distance < minDistance) {
        minDistance = distance;
        matchedUser = user;
      }
    }

    const today = getTodayDate();

    const locationData = location || {
      placeName: "TechNG Institute",
      coordinates: { lat: 0, lng: 0 }
    };

    /* ===== Existing User Login ===== */

    if (matchedUser && minDistance < THRESHOLD) {

      const alreadyMarked = await Attendance.findOne({
        userId: matchedUser._id,
        date: today
      });

      if (alreadyMarked && alreadyMarked.loginTime) {
        return res.json({
          success: false,
          message: "Attendance already marked today"
        });
      }

      await Attendance.create({
        userId: matchedUser._id,
        date: today,
        loginTime: new Date(),
        logoutTime: null,
        location: locationData
      });

      return res.json({
        success: true,
        newUser: false,
        message: `Welcome ${matchedUser.name}`,
        user: {
          _id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email
        }
      });
    }

    /* ===== New User Registration ===== */

    if (!name || !email) {
      return res.json({
        success: true,
        newUser: true,
        message: "New face detected. Please register."
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const newUser = await User.create({
      name,
      email,
      faceDescriptor: descriptor
    });

    await Attendance.create({
      userId: newUser._id,
      date: today,
      loginTime: new Date(),
      logoutTime: null,
      location: locationData
    });

    return res.json({
      success: true,
      newUser: false,
      message: `Welcome ${newUser.name}`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= LOGOUT ================= */

const markLogout = async (req, res) => {

  try {

    const { email, name } = req.body;

    const today = getTodayDate();

    const user = await User.findOne({ email, name });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const attendance = await Attendance.findOne({
      userId: user._id,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found"
      });
    }

    attendance.logoutTime = new Date();
    await attendance.save();

    return res.json({
      success: true,
      message: "Logout updated"
    });

  } catch (error) {

    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= HISTORY ================= */

const getUserAttendance = async (req, res) => {

  try {

    const { userId } = req.query;

    const data = await Attendance.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (error) {

    res.status(500).json([]);
  }
};

/* ================= DASHBOARD STATS ================= */

const getDashboardStats = async (req, res) => {

  try {

    const today = getTodayDate();

    const totalAttendance =
      await Attendance.countDocuments();

    const todayAttendance =
      await Attendance.countDocuments({
        date: today
      });

    res.json({
      success: true,
      totalAttendance,
      todayAttendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= EXPORT ================= */

module.exports = {
  loginUser,
  markLogout,
  getUserAttendance,
  getDashboardStats
};