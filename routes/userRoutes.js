const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Your User model
const Admin = require("../models/Admin"); // Admin model (for face login)
const Attendance = require("../models/Attendance"); // Attendance model

// ------------------- EUCLIDEAN DISTANCE -------------------
function euclideanDistance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) sum += (arr1[i] - arr2[i]) ** 2;
  return Math.sqrt(sum);
}

// ------------------- CHECK USER BY EMAIL -------------------
router.get("/check", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Check User Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ------------------- GET ALL USERS -------------------
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ------------------- CHECK USER EMAIL -------------------
router.get("/check", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: true,
        exists: true,
        message: "User already registered"
      });
    }

    res.json({
      success: true,
      exists: false,
      message: "User not registered"
    });

  } catch (err) {
    console.error("Check User Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ------------------- ADD USER -------------------
router.post("/add", async (req, res) => {
  try {
    const { name, email, employeeId, faceDescriptor } = req.body;

    if (!name || !email || !employeeId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const newUser = new User({
      name,
      email,
      employeeId,
      faceDescriptor,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User added",
      user: newUser,
    });
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ------------------- DAILY FACE LOGIN -------------------
router.post("/daily-face-login", async (req, res) => {
  try {
    const { faceDescriptor, location } = req.body;

    if (!faceDescriptor || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid face descriptor",
      });
    }

    const allAdmins = await Admin.find();
    let matchedAdmin = null;

    for (let admin of allAdmins) {
      const dist = euclideanDistance(faceDescriptor, admin.faceDescriptor);
      if (dist < 0.5) {
        matchedAdmin = admin;
        break;
      }
    }

    if (!matchedAdmin) {
      return res.status(400).json({
        success: false,
        message: "Face not recognized",
      });
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let attendance = await Attendance.findOne({
      employeeId: matchedAdmin.employeeId,
      date: {
        $gte: new Date(`${todayStr}T00:00:00`),
        $lte: new Date(`${todayStr}T23:59:59`),
      },
    });

    if (!attendance) {
      attendance = new Attendance({
        userId: matchedAdmin._id,
        employeeId: matchedAdmin.employeeId,
        name: matchedAdmin.name,
        date: new Date(todayStr),
        loginTime: new Date(),
        location: location || {},
        status: "Present",
      });

      await attendance.save();
    }

    res.json({
      success: true,
      message: "Login successful",
      attendance,
      user: matchedAdmin,
    });
  } catch (err) {
    console.error("Daily Face Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ------------------- GET USER ATTENDANCE -------------------
router.get("/attendance/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    const records = await Attendance.find({ employeeId }).sort({ date: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    console.error("Fetch Attendance Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;