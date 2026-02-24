// middleware/adminAuth.js
const { validateToken } = require("../service/auth");

function requireAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  const { valid, payload, message } = validateToken(token);

  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: message || "Invalid token" });
  }

  // Payload is { user: { id, email, role } } because createToken({user})
  const userData = payload.user || payload;

  if (!userData.role || userData.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin only route" });
  }

  // attach to request
  req.admin = userData;
  next();
}

module.exports = { requireAdmin };
