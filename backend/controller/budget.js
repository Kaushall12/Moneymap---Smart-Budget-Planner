const mongoose = require("mongoose");
const BudgetModel = require("../models/budget");
const ExpenseModel = require("../models/expense");
const SavingModel = require("../models/saving");
const IncomeModel = require("../models/income");

// adjust these paths to your project:
const User = require("../models/register");
const sendSMS = require("../utils/sendSMS");

/** Helper: return a mongoose ObjectId or null */
function toObjectIdOrNull(id) {
  if (!id) return null;
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

/**
 * Create or update a budget for a given user/year/month.
 * Expected body: { user_id, year, month, budgetPercent, title, notes }
 * overallLimit is NOT sent from frontend; it is computed from income.
 */
async function createOrUpdateBudget(req, res) {
  try {
    const {
      user_id,
      year,
      month,
      budgetPercent = 0,
      title = "",
      notes = "",
    } = req.body;

    if (!user_id || !year || !month) {
      return res
        .status(400)
        .json({ success: false, message: "user_id, year and month are required" });
    }

    const userObjectId = toObjectIdOrNull(user_id);
    if (!userObjectId) {
      return res.status(400).json({ success: false, message: "Invalid user_id" });
    }

    // Clamp percent between 0–100
    let pct = Number(budgetPercent) || 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    const filter = {
      user_id: userObjectId,
      year: Number(year),
      month: Number(month),
    };

    const update = {
      $set: {
        title,
        notes,
        budgetPercent: pct,
        // we don't set overallLimit/saving fields here; they are computed
      },
      // if you want to reset the 80% flag when user changes the month or percent:
      // $setOnInsert: { notified80Percent: false }, // optional
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    const budget = await BudgetModel.findOneAndUpdate(filter, update, options);
    return res.status(200).json({ success: true, budget });
  } catch (err) {
    console.error("createOrUpdateBudget error:", err.message || err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Budget for this month already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Compute budget summary for a user in a given year/month.
 * - Reads total Income for the month
 * - Reads total Expenses for the month
 * - Computes:
 *      overallLimit = totalIncome * (budgetPercent / 100)
 *      savingAmount = totalIncome - overallLimit
 *      savingPercent = 100 - budgetPercent
 * - Ensures overallLimit never exceeds totalIncome
 * - Updates the Budget document with these fields
 * - Sends SMS when overallSpent >= 80% of overallLimit (once per month)
 *   BUT ONLY if overallSpent <= overallLimit (not after user crosses the limit)
 */
// async function computeBudgetSummary(userId, year, month) {
//   const userObjectId = mongoose.isValidObjectId(userId)
//     ? new mongoose.Types.ObjectId(userId)
//     : userId;

//   // 1) find budget (may be null if user didn't create one)
//   const budget = await BudgetModel.findOne({
//     user_id: userObjectId,
//     year: Number(year),
//     month: Number(month),
//   });

//   // 2) Month date range
//   const start = new Date(Number(year), Number(month) - 1, 1);
//   const end = new Date(Number(year), Number(month), 1); // exclusive

//   // 3) Total incomes in month
//   const incomesAgg = await mongoose.model("Income").aggregate([
//     { $match: { user_id: userObjectId, date: { $gte: start, $lt: end } } },
//     { $group: { _id: null, total: { $sum: "$amount" } } },
//   ]);
//   const totalIncome = incomesAgg[0]?.total || 0;

//   // 4) Total expenses in month
//   const expensesAgg = await ExpenseModel.aggregate([
//     { $match: { user_id: userObjectId, date: { $gte: start, $lt: end } } },
//     { $group: { _id: null, total: { $sum: "$amount" } } },
//   ]);
//   const overallSpent = expensesAgg[0]?.total || 0;

//   // 5) Percentage-based overall values
//   let budgetPercent = budget?.budgetPercent ?? 0;
//   if (budgetPercent < 0) budgetPercent = 0;
//   if (budgetPercent > 100) budgetPercent = 100;

//   // Amount user allows to spend this month
//   let overallLimit = Math.round((totalIncome * budgetPercent) / 100);
//   if (overallLimit > totalIncome) {
//     overallLimit = totalIncome;
//   }

//   const savingAmount = totalIncome - overallLimit;
//   const savingPercent = totalIncome > 0 ? 100 - budgetPercent : 0;

//   const overallBudgetRemaining = overallLimit - overallSpent;
//   const cashRemaining = totalIncome - overallSpent;

//   // 6) Prepare 80% alert logic
//   let shouldSend80Alert = false;
//   let percentSpent = 0;

//   if (overallLimit > 0) {
//     percentSpent = Math.round((overallSpent / overallLimit) * 100);
//   }

//   if (budget) {
//     const updates = {};

//     if (budget.overallLimit !== overallLimit) updates.overallLimit = overallLimit;
//     if (budget.savingAmount !== savingAmount) updates.savingAmount = savingAmount;
//     if (budget.savingPercent !== savingPercent) updates.savingPercent = savingPercent;
//     if (budget.budgetPercent !== budgetPercent) updates.budgetPercent = budgetPercent;

//     // ✅ Only send alert if:
//     // - not already notified
//     // - overallLimit > 0
//     // - spent is >= 80% of limit
//     // - spent is <= 100% of limit (DO NOT send after they cross the limit)
//     if (

//       overallLimit > 0 &&
//       overallSpent >= 0.8 * overallLimit &&
//       overallSpent <= overallLimit
//     ) {
//       //updates.notified80Percent = true;
//       shouldSend80Alert = true;
//     }

//     if (Object.keys(updates).length > 0) {
//       await BudgetModel.updateOne({ _id: budget._id }, { $set: updates });
//       Object.assign(budget, updates);
//     }
//   }

//   // 7) Send SMS if threshold is reached and we have a budget
//   if (shouldSend80Alert && budget) {
//     try {
//       const user = await User.findById(budget.user_id);

//       // 🔴 IMPORTANT: change user.phone to your actual mobile field (e.g. user.mobile)
//       if (user && user.phone) {
//         const msg = `MoneyMap alert: You have used ${percentSpent}% of your monthly budget for ${month}/${year}.
// Budget: ₹${overallLimit}
// Spent: ₹${overallSpent}
// Remaining: ₹${overallBudgetRemaining}`;

//         await sendSMS(user.phone, msg);
//         console.log("80% budget alert SMS sent to", user.phone);
//       }
//     } catch (err) {
//       console.error("Error sending 80% budget alert SMS:", err);
//     }
//   }

//   return {
//     budget,
//     summary: {
//       year: Number(year),
//       month: Number(month),
//       totalIncome,
//       overallSpent,
//       overallLimit,
//       overallBudgetRemaining,
//       cashRemaining,
//       budgetPercent,
//       savingPercent,
//       savingAmount,
//     },
//   };
// }

async function computeBudgetSummary(userId, year, month) {
  console.log("📊 computeBudgetSummary called for user:", userId);
  const userObjectId = mongoose.isValidObjectId(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // 1) find budget (may be null if user didn't create one)
  const budget = await BudgetModel.findOne({
    user_id: userObjectId,
    year: Number(year),
    month: Number(month),
  });

  // 2) Month date range
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1); // exclusive

  // 3) Total incomes in month
  const incomesAgg = await IncomeModel.aggregate([
    { $match: { user_id: userObjectId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalIncome = incomesAgg[0]?.total || 0;

  // 4) Total expenses in month
  const expensesAgg = await ExpenseModel.aggregate([
    { $match: { user_id: userObjectId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const overallSpent = expensesAgg[0]?.total || 0;

  // 5) Percentage-based overall values (from budget)
  let budgetPercent = budget?.budgetPercent ?? 0;
  if (budgetPercent < 0) budgetPercent = 0;
  if (budgetPercent > 100) budgetPercent = 100;

  // Amount user allows to spend this month
  let overallLimit = Math.round((totalIncome * budgetPercent) / 100);
  if (overallLimit > totalIncome) {
    overallLimit = totalIncome;
  }

  // Savings from budget logic (percentage-based)
  const savingAmount = totalIncome - overallLimit;
  const savingPercent = totalIncome > 0 ? 100 - budgetPercent : 0;

  const overallBudgetRemaining = overallLimit - overallSpent;
  const cashRemaining = totalIncome - overallSpent; // actual saving = income - expense

  // 5b) ⬅️ NEW: upsert monthly Saving document
  await SavingModel.findOneAndUpdate(
    {
      user_id: userObjectId,
      year: Number(year),
      month: Number(month),
    },
    {
      $set: {
        user_id: userObjectId,
        year: Number(year),
        month: Number(month),

        // From budget (percentage-based)
        savingPercent,
        plannedSavingAmount: savingAmount,

        // Actual saving (what you asked for): total income - total expense
        actualSavingAmount: cashRemaining,

        totalIncome,
        totalExpense: overallSpent,
      },
    },
    { upsert: true, new: true }
  );

  // 6) Prepare 80% alert logic
  let shouldSend80Alert = false;
  let percentSpent = 0;

  if (overallLimit > 0) {
    percentSpent = Math.round((overallSpent / overallLimit) * 100);
  }

  if (budget) {
    const updates = {};

    if (budget.overallLimit !== overallLimit) updates.overallLimit = overallLimit;
    // ⬇️ removed savingAmount/savingPercent, they are now in Saving model
    if (budget.budgetPercent !== budgetPercent) updates.budgetPercent = budgetPercent;

    // ✅ Only send alert if:
    // - not already notified
    // - overallLimit > 0
    // - spent is >= 80% of limit
    // - spent is <= 100% of limit (DO NOT send after they cross the limit)
    if (
      // !budget.notified80Percent &&
      overallLimit > 0 &&
      overallSpent >= 0.8 * overallLimit &&
      overallSpent <= overallLimit
    ) {
      // updates.notified80Percent = true;
      shouldSend80Alert = true;
    }

    if (Object.keys(updates).length > 0) {
      await BudgetModel.updateOne({ _id: budget._id }, { $set: updates });
      Object.assign(budget, updates);
    }
  }

  // 7) Send SMS if threshold is reached and we have a budget
  if (shouldSend80Alert && budget) {
    try {
      const user = await User.findById(budget.user_id);

      // 🔴 IMPORTANT: change user.phone to your actual mobile field (e.g. user.mobile)
      if (user && user.mobile) {
        const msg = `Alert: You have used ${percentSpent}% of your monthly budget for ${month}/${year}. Please check your expenses.`;
        await sendSMS(user.mobile, msg);
      }
    } catch (err) {
      console.error("Failed to send 80% budget SMS:", err);
    }
  }

  return {
    budget,
    summary: {
      year: Number(year),
      month: Number(month),
      totalIncome,
      overallSpent,
      overallLimit,
      overallBudgetRemaining,
      cashRemaining,
      budgetPercent,
      savingPercent,
      savingAmount,
    },
  };
}


/**
 * List budgets for a user
 * Query param: user_id
 */
async function listBudgets(req, res) {
  try {
    const user_id = req.query.user_id;
    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id query param required" });
    }

    const userObjectId = toObjectIdOrNull(user_id);
    if (!userObjectId) {
      return res.status(400).json({ success: false, message: "Invalid user_id" });
    }

    const budgets = await BudgetModel.find({ user_id: userObjectId }).sort({
      year: -1,
      month: -1,
    });
    return res.status(200).json({ success: true, budgets });
  } catch (err) {
    console.error("listBudgets error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Get a budget by id and include summary
 */
async function getBudgetById(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const budget = await BudgetModel.findById(id);
    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    const result = await computeBudgetSummary(
      budget.user_id,
      budget.year,
      budget.month
    );

    return res.status(200).json({
      success: true,
      budget: result.budget,
      summary: result.summary,
    });
  } catch (err) {
    console.error("getBudgetById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Delete a budget by id
 */
async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await BudgetModel.deleteOne({ _id: id });
    return res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (err) {
    console.error("deleteBudget error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Get current month budget + summary
 * Query: ?user_id=...
 */
async function getCurrentBudget(req, res) {
  try {
    const user_id = req.query.user_id;
    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "user_id required" });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const result = await computeBudgetSummary(user_id, year, month);

    if (!result.budget) {
      return res
        .status(200)
        .json({ success: true, budget: null, summary: result.summary });
    }

    return res
      .status(200)
      .json({ success: true, budget: result.budget, summary: result.summary });
  } catch (err) {
    console.error("getCurrentBudget error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createOrUpdateBudget,
  listBudgets,
  getBudgetById,
  deleteBudget,
  computeBudgetSummary,
  getCurrentBudget,
};
