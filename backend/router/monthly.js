// backend/router/monthly.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const IncomeModel = require("../models/income");
const ExpenseModel = require("../models/expense");

// Helper: parse month "YYYY-MM" into start/end Date objects
function monthRangeFromYYYYMM(monthStr) {
  if (monthStr) {
    const [yStr, mStr] = monthStr.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
      throw new Error("Invalid month format, expected YYYY-MM");
    }
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 1, 0, 0, 0, 0);
    return { start, end };
  } else {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0);
    return { start, end };
  }
}

// GET /monthly/income?user_id=...&month=YYYY-MM
router.get("/income", async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ message: "user_id required" });

    // validate object id
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user_id (not a valid ObjectId)" });
    }
    // create an ObjectId instance safely (use new)
    const uid = new mongoose.Types.ObjectId(userId);

    const { start, end } = monthRangeFromYYYYMM(req.query.month);

    const agg = await IncomeModel.aggregate([
      { $match: { user_id: uid, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const total = agg && agg.length > 0 ? agg[0].total : 0;
    return res.json({ income: total });
  } catch (err) {
    console.error("monthly/income error:", err);
    return res.status(500).json({ message: "Failed to fetch monthly income", error: err.message });
  }
});

// GET /monthly/expense?user_id=...&month=YYYY-MM
router.get("/expense", async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ message: "user_id required" });

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user_id" });
    }
    const uid = new mongoose.Types.ObjectId(userId);

    const { start, end } = monthRangeFromYYYYMM(req.query.month);

    const agg = await ExpenseModel.aggregate([
      { $match: { user_id: uid, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$category",      // ✅ dynamic category
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
    ]);

    // return directly — dashboard already supports this
    return res.json(agg);

  } catch (err) {
    console.error("monthly/expense error:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch monthly expenses" });
  }
});


module.exports = router;
