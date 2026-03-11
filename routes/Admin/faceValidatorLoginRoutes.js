const express = require("express");
const router = express.Router();
const Admin = require("../../models/Admin"); // make sure you have Admin model

// POST /api/admin/login-face
router.post("/login-face", async (req, res) => {
  try {
    const { email, faceDescriptor } = req.body;

    if (!email || !faceDescriptor || faceDescriptor.length !== 128) {
      return res.status(400).json({ success: false, message: "Missing or invalid fields" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Compare face descriptors
    const storedDescriptor = admin.faceDescriptor;
    let distance = 0;

    for (let i = 0; i < 128; i++) {
      distance += Math.pow(storedDescriptor[i] - faceDescriptor[i], 2);
    }
    distance = Math.sqrt(distance);

    // Threshold for face match (you can tweak it: 0.4 is typical)
    if (distance < 0.4) {
      return res.json({ success: true, message: "Login successful", admin });
    } else {
      return res.status(401).json({ success: false, message: "Face does not match" });
    }
  } catch (error) {
    console.error("Face Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;