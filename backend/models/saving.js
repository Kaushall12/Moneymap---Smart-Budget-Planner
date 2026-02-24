// models/saving.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

/**
 * One document = savings for a user in a specific year/month
 * - savingPercent, plannedSavingAmount: derived from Budget (percentage based)
 * - actualSavingAmount: totalIncome - totalExpense (real saving)
 */
const SavingSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },

    // From budget logic: 100 - budgetPercent
    savingPercent: { type: Number, default: 0 },

    // Planned saving (from budget): totalIncome - overallLimit
    plannedSavingAmount: { type: Number, default: 0 },

    // Actual saving: totalIncome - totalExpense
    actualSavingAmount: { type: Number, default: 0 },

    // For reference on dashboard
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Ensure one saving doc per user per month/year
SavingSchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });

const SavingModel = model("Saving", SavingSchema);
module.exports = SavingModel;
