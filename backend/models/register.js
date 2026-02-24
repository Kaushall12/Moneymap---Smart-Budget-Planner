const mongoose = require("mongoose");
const { Schema, model } = mongoose;

function formatDate() {
  const date = new Date();
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

const regSchema = new Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },

  profilePic: { type: String, default: "" },

  isPro: { type: Boolean, default: false },

  lastPayment: {
    orderId: { type: String, default: "" },
    paymentId: { type: String, default: "" },
    verifiedAt: { type: String, default: "" },
  },

  createdAt: { type: String, default: formatDate },
  updatedAt: { type: String, default: formatDate },
});

regSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = model("User", regSchema);

