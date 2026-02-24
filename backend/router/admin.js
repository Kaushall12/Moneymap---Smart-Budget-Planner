// router/admin.js
const express = require("express");
const router = express.Router();

const { adminLogin, changeAdminPassword } = require("../controller/admin");
const { requireAdmin } = require("../middleware/adminAuth");
const User = require("../models/register");

// 1) Admin login
router.post("/login", adminLogin);

// 2) Change admin password (auth required)
router.post("/change-password", requireAdmin, changeAdminPassword);

// 3) Get Pro vs non-Pro summary + user lists
router.get("/pro-stats", requireAdmin, async (req, res) => {
  try {
    // Only needed fields
    const users = await User.find(
      { role: { $ne: "admin" } },
      "name email mobile isPro lastPayment createdAt"
    ).lean();

    const proUsers = users.filter((u) => u.isPro === true);
    const freeUsers = users.filter((u) => !u.isPro);

    return res.json({
      success: true,
      totals: {
        totalUsers: users.length,
        proUsers: proUsers.length,
        freeUsers: freeUsers.length,
      },
      proUsers,
      freeUsers,
    });
  } catch (err) {
    console.error("Admin pro-stats error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching pro stats" });
  }
});

module.exports = router;
