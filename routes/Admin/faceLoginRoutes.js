const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Euclidean distance function for face matching
function calculateDistance(desc1, desc2) {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

// Face login route
router.post("/face-login", async (req, res) => {
  try {
    const { employeeId, email, faceDescriptor } = req.body;

    if (!employeeId || !email || !faceDescriptor) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Find user by employeeId AND email
    const user = await User.findOne({ employeeId, email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare face descriptors
    const distance = calculateDistance(user.faceDescriptor, faceDescriptor);
    const THRESHOLD = 0.5; // strict match

    if (distance < THRESHOLD) {
      return res.status(200).json({
        message: "Login successful",
        user: {
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({ message: "Face does not match" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;