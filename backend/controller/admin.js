// controller/admin.js
const bcrypt = require("bcryptjs");
const User = require("../models/register");
const { createToken } = require("../service/auth");

// Static admin email (can also move to process.env.ADMIN_EMAIL)
const ADMIN_EMAIL = "admin@moneymap.com";

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Only this email is allowed as admin
    if (email !== ADMIN_EMAIL) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    // Find admin user with this email and role=admin
    const admin = await User.findOne({ email: ADMIN_EMAIL, role: "admin" });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found. Please create admin in DB.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }

    // JWT payload will contain role: 'admin'
    const token = createToken({
      id: admin._id,
      email: admin.email,
      role: "admin",
    });

    return res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error logging in admin" });
  }
}

// Change admin password (password dynamic)
async function changeAdminPassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both passwords are required" });
    }

    // req.admin will be set by admin auth middleware
    const adminId = req.admin.id;

    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    return res.json({
      success: true,
      message: "Admin password updated successfully",
    });
  } catch (err) {
    console.error("Change admin password error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error changing password" });
  }
}

module.exports = { adminLogin, changeAdminPassword };
