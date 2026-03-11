const nodemailer = require("nodemailer");

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "techngparames@gmail.com",       // <-- replace with your Gmail
    pass: "hftvxwsjoojnkisw", // <-- replace with Gmail App Password
  },
});

// Send invite email
const sendInviteMail = async ({ name, email, empId, faceLoginLink }) => {
  try {
    const mailOptions = {
      from: "techngparames@gmail.com",   // same as user above
      to: email,
      subject: "Employee Onboarding Invite",
      html: `
        <h2>🚀 Welcome to the Future of Attendance!</h2>
        <p>Hello <b>${name}</b>,</p>
        <p>Your <b>Employee ID</b>: ${empId}</p>
        <p>Email: <b>${email}</b></p>
        <p>Get ready to set up your <b>Face Login</b> for a seamless AI-powered attendance system:</p>
        <a href="${faceLoginLink}" style="display:inline-block;padding:10px 20px;background:#1a73e8;color:white;text-decoration:none;border-radius:5px;">Setup Face Login</a>
        <br><br>
        <p>Welcome aboard! 🌟</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { message: "Invite email sent successfully" };
  } catch (error) {
    console.error("Failed to send email", error);
    return { message: "Failed to send email", error: error.toString() };
  }
};

// ✅ Export function correctly
module.exports = { sendInviteMail };