// authController.js
// Purpose: Admin Face Login + Attendance Marking

// backend/controllers/authController.js
// backend/controllers/authController.js


const User = require("../models/User");
const Attendance = require("../models/Attendance");

const THRESHOLD = 0.5;

/* ================= DISTANCE CALCULATION ================= */

function calculateDistance(desc1, desc2) {
  let sum = 0;

  for (let i = 0; i < 128; i++) {
    sum += Math.pow((desc1[i] || 0) - (desc2[i] || 0), 2);
  }

  return Math.sqrt(sum);
}

/* ================= LOGIN + REGISTER ================= */

const loginUser = async (req, res) => {

  try {

    let { faceDescriptor, name, email, location } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid face descriptor"
      });
    }

    faceDescriptor = faceDescriptor.map(Number);

    if (faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor must be 128 length"
      });
    }

    /* ================= FIND MATCHED USER ================= */

    const users = await User.find({
      faceDescriptor: { $exists: true, $ne: [] }
    });

    let matchedUser = null;
    let minDistance = Infinity;

    for (const user of users) {

      if (!user.faceDescriptor || user.faceDescriptor.length !== 128)
        continue;

      const distance = calculateDistance(
        user.faceDescriptor,
        faceDescriptor
      );

      if (distance < minDistance) {
        minDistance = distance;
        matchedUser = user;
      }
    }

    const today = new Date().toISOString().split("T")[0];

    /* ================= LOCATION DEFAULT ================= */

    const attendanceLocation = location || {
      placeName: "TechNG Institute",
      coordinates: {
        lat: 0,
        lng: 0
      }
    };

    /* ================= EXISTING USER LOGIN ================= */

    if (matchedUser && minDistance < THRESHOLD) {

      const alreadyMarked = await Attendance.findOne({
        userId: matchedUser._id,
        date: today
      });

      if (alreadyMarked) {
        return res.json({
          success: false,
          message: "Attendance already marked today",
          trackerEnabled: true,
          user: {
            _id: matchedUser._id,
            name: matchedUser.name,
            email: matchedUser.email
          }
        });
      }

      await Attendance.create({
        userId: matchedUser._id,
        loginTime: new Date(),
        date: today,
        location: attendanceLocation
      });

      return res.json({
        success: true,
        newUser: false,
        trackerEnabled: true,
        message: `Welcome ${matchedUser.name}`,
        user: {
          _id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email
        }
      });
    }

    /* ================= NEW USER FLOW ================= */

    if (!name || !email) {
      return res.json({
        success: true,
        newUser: true,
        trackerEnabled: false,
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
      faceDescriptor
    });

    await Attendance.create({
      userId: newUser._id,
      loginTime: new Date(),
      date: today,
      location: attendanceLocation
    });

    return res.json({
      success: true,
      newUser: false,
      trackerEnabled: true,
      message: `Welcome ${newUser.name}`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {

    console.error("🔥 LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= EXPORT ================= */

module.exports = {
  login: loginUser
};