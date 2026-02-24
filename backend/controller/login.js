const Register = require("../models/register");
const bcrypt = require("bcryptjs");
const { createToken } = require("../service/auth"); // JWT helper

// Constants for lockout
const MAX_ATTEMPTS = 3;        // Max wrong attempts allowed
const LOCK_TIME = 7 * 60 * 1000; // 7 minutes in milliseconds

async function checkLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000); // seconds remaining
      return res.status(403).json({ 
        success: false, 
        message: `Account locked. Try again in ${remaining} seconds.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account if attempts exceeded
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
        await user.save();
        return res.status(403).json({
          success: false,
          message: `Account locked for 7 minutes due to multiple failed attempts.`
        });
      }

      await user.save();
      return res.status(400).json({ success: false, message: `Invalid password ${3 - user.loginAttempts} attempt remaining` });
    }

    // Successful login → reset attempts and lock
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = createToken ? createToken(user) : null;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPro : user.isPro
      },
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { checkLogin };
