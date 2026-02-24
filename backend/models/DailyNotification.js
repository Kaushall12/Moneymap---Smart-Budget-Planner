const mongoose = require("mongoose");

const DailyNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

DailyNotificationSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyNotification", DailyNotificationSchema);
