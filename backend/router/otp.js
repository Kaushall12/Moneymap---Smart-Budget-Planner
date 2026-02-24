const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Register = require("../models/register");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");


const JWT_SECRET = "@squid123"; // set real secret in production

// Store OTPs with expiry
let otpStore = {}; // { email: { otp: 123456, expires: timestamp } }

// Helper function to generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

// OTP expiration time (5 minutes)
const OTP_EXPIRE = 5 * 60 * 1000; // 5 minutes in ms

function formatDate() {
  const date = new Date();
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abcx10542@gmail.com",
    pass: "mtyo hqgs rvmp rpir",
  },
});

// Send OTP for registration
router.post("/send-otp", async (req, res) => {
  const { email, mobile } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Check duplicate mobile number
    const existingMobile = await Register.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    // 2️⃣ Generate OTP and store
    const otp = generateOtp();
    otpStore[email] = { otp, expires: Date.now() + OTP_EXPIRE };

    // 3️⃣ Prepare email
const mailOptions = {
  from: '"MoneyMap Support" <abcx10542@gmail.com>',
  to: email,
  subject: "🔐 OTP For Registration From MoneyMap",

  html: `
  <div style="font-family: Times New Roman, Times, serif; background:#f4f6f9; padding:20px;">
    <div style="
      max-width: 520px; 
      margin: auto; 
      background: white; 
      border-radius: 12px; 
      padding: 25px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    ">
      
      <h2 style="text-align:center; color:#0d6efd; margin-bottom:10px;">
        🔐 MoneyMap Security Verification
      </h2>

      <p style="font-size:15px; color:#555;">
        Hello,
      </p>
      
      <p style="font-size:15px; color:#555;">
        We received a request to your registration into <strong>MoneyMap</strong>. 
        Use the OTP below to proceed:
      </p>

      <div style="
        text-align:center; 
        margin:25px 0;
      ">
        <div style="
          font-size:32px; 
          font-weight:bold; 
          letter-spacing:4px; 
          padding:15px 20px; 
          background:#eef5ff; 
          color:#0d6efd; 
          border-radius:10px; 
          display:inline-block;
        ">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px; color:#555; margin-bottom:20px;">
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

      <p style="font-size:13px; color:#888; text-align:center;">
        Need help? Contact us at 
        <a href="mailto:abcx10542@gmail.com" style="color:#0d6efd; text-decoration:none;">
          abcx10542@gmail.com
        </a>
      </p>

      <p style="font-size:13px; color:#888; text-align:center; margin-top:10px;">
        © ${new Date().getFullYear()} MoneyMap. All rights reserved.
      </p>

    </div>
  </div>
  `,
};


    // 4️⃣ Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});

// Send OTP for forgot password
router.post("/send-otpForgot", async (req, res) => {
  const { email } = req.body;

  const user = await Register.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User Email Id does not exist" });
  }

  const otp = generateOtp();
  otpStore[email] = { otp, expires: Date.now() + OTP_EXPIRE };

  const mailOptions = {
  from: '"MoneyMap Support" <abcx10542@gmail.com>',
  to: email,
  subject: "🔐 Your MoneyMap Password Reset OTP",

  html: `
  <div style="font-family: Times New Roman, Times, serif; background:#f4f6f9; padding:20px;">
    <div style="
      max-width: 520px; 
      margin: auto; 
      background: white; 
      border-radius: 12px; 
      padding: 25px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    ">
      
      <h2 style="text-align:center; color:#0d6efd; margin-bottom:10px;">
        🔐 MoneyMap Security Verification
      </h2>

      <p style="font-size:15px; color:#555;">
        Hello,
      </p>
      
      <p style="font-size:15px; color:#555;">
        We received a request to reset your <strong>MoneyMap</strong> password. 
        Use the OTP below to proceed:
      </p>

      <div style="
        text-align:center; 
        margin:25px 0;
      ">
        <div style="
          font-size:32px; 
          font-weight:bold; 
          letter-spacing:4px; 
          padding:15px 20px; 
          background:#eef5ff; 
          color:#0d6efd; 
          border-radius:10px; 
          display:inline-block;
        ">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px; color:#555; margin-bottom:20px;">
        This OTP is valid for <strong>5 minutes</strong>.  
        If you did not request a password reset, please ignore this email — your account is safe.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

      <p style="font-size:13px; color:#888; text-align:center;">
        Need help? Contact us at 
        <a href="mailto:abcx10542@gmail.com" style="color:#0d6efd; text-decoration:none;">
          abcx10542@gmail.com
        </a>
      </p>

      <p style="font-size:13px; color:#888; text-align:center; margin-top:10px;">
        © ${new Date().getFullYear()} MoneyMap. All rights reserved.
      </p>

    </div>
  </div>
  `,
};


  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
});

// Verify OTP and register
router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, mobile, password, otp } = req.body;

    // 1️⃣ Verify OTP
    const record = otpStore[email];
    if (!record || record.otp != otp || record.expires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }
    delete otpStore[email];

    // 2️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Save user with hashed password
    const user = new Register({
      name,
      email,
      mobile,
      password: hashedPassword,
    });
    await user.save();

    return res.json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reset password with OTP
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Verify OTP
    const record = otpStore[email];
    if (!record || record.otp != otp || record.expires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }
    delete otpStore[email];

    // Find user
    const user = await Register.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = formatDate();
    await user.save();

    res.json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/profilePics";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// Format date helper
function formatDate() {
  return new Date().toISOString();
}
// Update user profile route
router.put("/update-profile", upload.single("profilePic"), async (req, res) => {
  try {
    const { email, name, mobile, password } = req.body;

    const user = await Register.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;

    if (mobile) {
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ success: false, message: "Mobile number must be 10 digits" });
      }

      const exists = await Register.findOne({ mobile });
      if (exists && exists.email !== email) {
        return res.status(400).json({ success: false, message: "Mobile number already in use" });
      }

      user.mobile = mobile;
    }

    if (password && password !== "********") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.profilePic = `/uploads/profilePics/${req.file.filename}`;
    }

    user.updatedAt = formatDate();
    await user.save();

    // Prepare sanitized user payload for token (do NOT include password)
    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      profilePic: user.profilePic, // path like /uploads/profilePics/xxx
      updatedAt: user.updatedAt,
    };

    // Sign a new JWT containing the updated user
    const token = jwt.sign({ user: userPayload }, JWT_SECRET, { expiresIn: "1d" });

    // Return updated user and token
    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: userPayload,
      token,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
