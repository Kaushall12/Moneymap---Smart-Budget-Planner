// controller/saving.js
const mongoose = require("mongoose");
const SavingModel = require("../models/saving");

function toObjectIdOrNull(id) {
  if (!id) return null;
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

// GET /saving?user_id=...
// Returns all monthly savings + total actual saving
async function getUserSavings(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id query param required" });
    }

    const userObjectId = toObjectIdOrNull(user_id);
    if (!userObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user_id" });
    }

    const savings = await SavingModel.find({ user_id: userObjectId })
      .sort({ year: 1, month: 1 })
      .lean();

    const totalActualSaving = savings.reduce(
      (sum, s) => sum + Number(s.actualSavingAmount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      totalActualSaving,
      savings,
    });
  } catch (err) {
    console.error("getUserSavings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching savings" });
  }
}

module.exports = {
  getUserSavings,
};
