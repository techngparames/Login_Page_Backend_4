// backend/routes/Admin/adminRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../../models/User");

// ================= CONSTANTS =================
const FACE_THRESHOLD = 0.5;

// ================= HELPERS =================
function euclideanDistance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += (arr1[i] - arr2[i]) ** 2;
  }
  return Math.sqrt(sum);
}

// ================= SEND INVITE EMAIL =================
router.post("/send-invite", async (req, res) => {
  try {
    const { name, email, empId } = req.body;

    if (!name || !email || !empId)
      return res.status(400).json({ message: "Missing required fields" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "techngparames@gmail.com",
        pass: "hftvxwsjoojnkisw",
      },
    });

    const faceLoginLink = `http://localhost:3000/face-login?name=${encodeURIComponent(
      name
    )}&email=${encodeURIComponent(email)}&empId=${encodeURIComponent(empId)}`;

    await transporter.sendMail({
      from: "techngparames@gmail.com",
      to: email,
      subject: "Setup Your Face Login",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your Employee ID: <b>${empId}</b></p>
        <p>Email: <b>${email}</b></p>
        <a href="${faceLoginLink}" 
        style="padding:12px 25px;background:#1abc9c;color:white;border-radius:8px;text-decoration:none;">
        Setup Face Login
        </a>
      `,
    });

    res.json({ success: true, message: "Invite sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ================= REGISTER EMPLOYEE FACE =================
router.post("/register-employee", async (req, res) => {
  try {
    const { name, email, employeeId, faceDescriptor } = req.body;

    if (!name || !email || !employeeId || !faceDescriptor)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing)
      return res.status(400).json({ message: "Employee already exists" });

    const newUser = new User({
      name,
      email,
      employeeId,
      faceDescriptor,
      loginCount: 0,
      loginHistory: [],
    });

    await newUser.save();
    res.json({ success: true, message: "Employee registered successfully ✅", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed ❌" });
  }
});

// ================= FACE LOGIN =================
router.post("/face-login", async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    const allUsers = await User.find();

    for (let user of allUsers) {
      const distance = euclideanDistance(faceDescriptor, user.faceDescriptor);
      if (distance < FACE_THRESHOLD) {
        // Restrict one login per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const alreadyLoggedToday = user.loginHistory.some(
          (s) => s.loginTime && new Date(s.loginTime) >= today
        );
        if (alreadyLoggedToday) {
          return res.status(400).json({ success: false, message: "Already logged in today" });
        }

        // Create a new login session
        const now = new Date();
        user.loginHistory.push({ loginTime: now, pauseTime: [], logoutTime: null, totalWorked: 0 });
        user.lastLogin = now;
        user.loginCount += 1;
        await user.save();

        return res.json({ success: true, user });
      }
    }

    res.json({ success: false, message: "Face not recognized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ================= EMPLOYEE ACTION (LOGIN / PAUSE / LOGOUT) =================
router.post("/employee/action", async (req, res) => {
  try {
    const { employeeId, action } = req.body;
    if (!employeeId || !action)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await User.findOne({ employeeId });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.loginHistory = user.loginHistory || [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSession =
      user.loginHistory.length > 0 ? user.loginHistory[user.loginHistory.length - 1] : null;

    if (action === "login") {
      // Restrict login once per day
      const alreadyLoggedToday = user.loginHistory.some(
        (s) => s.loginTime && new Date(s.loginTime) >= today
      );
      if (alreadyLoggedToday) {
        return res.status(400).json({ success: false, message: "Already logged in today" });
      }

      const newSession = { loginTime: now, pauseTime: [], logoutTime: null, totalWorked: 0 };
      user.loginHistory.push(newSession);
      user.lastLogin = now;
      user.loginCount += 1;

    } else if (action === "pause") {
      if (!lastSession || lastSession.logoutTime) {
        return res.status(400).json({ success: false, message: "No active session to pause" });
      }
      lastSession.pauseTime = lastSession.pauseTime || [];
      lastSession.pauseTime.push({ start: now, end: null });

    } else if (action === "resume") {
      if (!lastSession || lastSession.logoutTime || !lastSession.pauseTime || lastSession.pauseTime.length === 0) {
        return res.status(400).json({ success: false, message: "No active pause to resume" });
      }
      const currentPause = lastSession.pauseTime[lastSession.pauseTime.length - 1];
      if (!currentPause.end) {
        currentPause.end = now;
      }

    } else if (action === "logout") {
      if (!lastSession || lastSession.logoutTime) {
        return res.status(400).json({ success: false, message: "No active session to logout" });
      }
      lastSession.logoutTime = now;

      // Calculate totalWorked
      let totalPause = 0;
      if (lastSession.pauseTime && lastSession.pauseTime.length > 0) {
        lastSession.pauseTime.forEach((p) => {
          const start = new Date(p.start).getTime();
          const end = p.end ? new Date(p.end).getTime() : now.getTime();
          totalPause += end - start;
        });
      }
      lastSession.totalWorked = lastSession.logoutTime - lastSession.loginTime - totalPause;
    }

    await user.save();
    return res.json({
      success: true,
      message: `${action} recorded`,
      user,
      lastSession: user.loginHistory[user.loginHistory.length - 1],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Action failed" });
  }
});

// ================= EMPLOYEES LIST =================
router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find().sort({ createdAt: -1 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeToday = employees.filter(
      (emp) => emp.lastLogin && new Date(emp.lastLogin) >= today
    );

    res.json({
      success: true,
      totalEmployees: employees.length,
      activeToday: activeToday.length,
      employees,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================= EMPLOYEE ACTIVITY =================
router.get("/employee-activity", async (req, res) => {
  try {
    const employees = await User.find({}, { name: 1, email: 1, employeeId: 1, loginHistory: 1 });
    res.json({ success: true, employees });
  } catch (err) {
    console.error("Error fetching employee activity:", err);
    res.status(500).json({ success: false, message: "Failed to fetch activity" });
  }
});

// ================= EMPLOYEE COUNT =================
router.get("/employee-count", async (req, res) => {
  const count = await User.countDocuments();
  res.json({ success: true, totalEmployees: count });
});

// ================= DELETE EMPLOYEE =================
router.delete("/employee/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Employee removed" });
});

// ================= UPDATE EMPLOYEE =================
router.put("/employee/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, employee: updated });
});

// ================= ONBOARDED EMPLOYEES =================
router.get("/onboarded-employees", async (req, res) => {
  try {
    const employees = await User.find({}, { _id: 0, employeeId: 1, name: 1, email: 1, faceDescriptor: 1 });
    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch onboarded employees" });
  }
});

module.exports = router;