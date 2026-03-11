const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

// ================= Middleware =================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= Import Routes =================
const adminRoutes = require("./routes/Admin/adminRoutes"); // includes /add-user
const sendInviteRoute = require("./routes/sendInvite");
const faceLoginRoutes = require("./routes/faceLoginRoutes");
const trackerRoutes = require("./routes/trackerRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeActivityRoute = require("./routes/employeeActivity");
const adminEmployeesRoute = require("./routes/adminEmployeesRoute");

// ================= Mount Routes =================
app.use("/api/admin", adminRoutes);              // Admin routes (including add-user)
app.use("/api/admin/send-invite", sendInviteRoute);
app.use("/api/admin", adminEmployeesRoute);     // Onboarded employees routes
app.use("/api", faceLoginRoutes);               // Face login
app.use("/api", trackerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employee", employeeActivityRoute);

// ================= MongoDB connection =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ================= Start server =================
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));