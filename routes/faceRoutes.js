const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Attendance = require("../models/Attendance");

// Office location: TechNG Perungudi
const TECHNG_LOCATION = { lat: 13.0115, lng: 80.2368 };
const MAX_DISTANCE_METERS = 350; // allow GPS variation

// ------------------ Helper Functions ------------------

// Haversine formula to calculate distance between two GPS points
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Face descriptor distance calculation
function getFaceDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// ------------------ POST /api/face/login ------------------
router.post("/login", async (req, res) => {
  try {
    const { faceDescriptor, location } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, message: "Face descriptor required" });
    }

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return res.status(400).json({ success: false, message: "Location required" });
    }

    console.log("Received location:", location);
    const distance = getDistanceMeters(location.lat, location.lng, TECHNG_LOCATION.lat, TECHNG_LOCATION.lng);
    console.log("Distance from office:", distance, "meters");

    if (distance > MAX_DISTANCE_METERS) {
      return res.status(403).json({
        success: false,
        message: `You are outside the allowed location radius ❌ (${Math.round(distance)}m away)`
      });
    }

    // Match face
    const users = await User.find();
    let matchedUser = null;
    for (let user of users) {
      if (!user.faceDescriptor) continue;
      const dist = getFaceDistance(faceDescriptor, user.faceDescriptor);
      if (dist < 0.6) { // threshold
        matchedUser = user;
        break;
      }
    }

    // Existing user attendance check
    if (matchedUser) {
      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = await Attendance.findOne({ userId: matchedUser._id, date: today });

      if (todayAttendance) {
        return res.json({
          success: true,
          alreadyMarked: true,
          message: "Today's attendance already marked ✅",
          user: matchedUser
        });
      } else {
        const newAttendance = new Attendance({
          userId: matchedUser._id,
          date: today,
          loginTime: new Date(),
          location
        });
        await newAttendance.save();
        return res.json({
          success: true,
          alreadyMarked: false,
          message: "Attendance marked successfully ✅",
          user: matchedUser
        });
      }
    }

    // New user (face not recognized)
    return res.json({ success: false, newUser: true, message: "Face not recognized — please register" });
  } catch (err) {
    console.error("FACE LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error during face login" });
  }
});

// ------------------ POST /api/face/register ------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, faceDescriptor, location } = req.body;

    if (!name || !email || !faceDescriptor) {
      return res.status(400).json({ success: false, message: "Name, email, and face data required" });
    }

    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ success: false, message: "Email must end with @gmail.com" });
    }

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return res.status(400).json({ success: false, message: "Location required" });
    }

    console.log("Register location:", location);
    const distance = getDistanceMeters(location.lat, location.lng, TECHNG_LOCATION.lat, TECHNG_LOCATION.lng);
    console.log("Distance from office:", distance, "meters");

    if (distance > MAX_DISTANCE_METERS) {
      return res.status(403).json({
        success: false,
        message: `You are outside the allowed location radius ❌ (${Math.round(distance)}m away)`
      });
    }

    // Create user and mark attendance
    const newUser = new User({ name, email, faceDescriptor });
    await newUser.save();

    const today = new Date().toISOString().split("T")[0];
    const newAttendance = new Attendance({
      userId: newUser._id,
      date: today,
      loginTime: new Date(),
      location
    });
    await newAttendance.save();

    res.json({ success: true, message: "User registered and attendance marked ✅", user: newUser });
  } catch (err) {
    console.error("FACE REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

module.exports = router;