const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const BudgetSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, default: "Monthly Budget" },

    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },

    // User-selected percentage of income to spend (0–100)
    budgetPercent: { type: Number, default: 0 }, // e.g. 60

    // Computed total amount user allows to spend (budgetPercent * totalIncome)
    overallLimit: { type: Number, default: 0 }, // ₹

    // Remaining percent and amount treated as savings
    // savingPercent: { type: Number, default: 0 }, // e.g. 40
    // savingAmount: { type: Number, default: 0 },   // ₹

    notes: { type: String, default: "" },

    // NEW: to prevent spamming SMS when user crosses 80% budget
    //notified80Percent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Ensure one budget per user per month/year
BudgetSchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });

const BudgetModel = model("Budget", BudgetSchema);
module.exports = BudgetModel;
