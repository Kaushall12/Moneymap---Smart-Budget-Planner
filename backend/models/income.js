const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const incomeSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: {type: String, default: ""},
  date: { type: Date, default: Date.now }
},{ timestamps: true });

const IncomeModel = model("Income", incomeSchema);
module.exports = IncomeModel