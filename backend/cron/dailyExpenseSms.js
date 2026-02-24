const cron = require("node-cron");
const mongoose = require("mongoose");
const sendSMS = require("../utils/sendSMS");

const User = require("../models/register");
const Expense = require("../models/expense");
const DailyNotification = require("../models/DailyNotification");

function formatDateYMD(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runDailyExpenseSMS(options = {}) {
  const throttleMs = options.throttleMs || 400;

  if (mongoose.connection.readyState !== 1) {
    console.warn("MongoDB not connected, skipping runDailyExpenseSMS");
    return;
  }

  const users = await User.find({ mobile: { $exists: true, $ne: "" } }).lean();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const dateKey = formatDateYMD(todayStart);

  console.log(`runDailyExpenseSMS: sending for ${dateKey} to ${users.length} users`);

  for (const user of users) {
    try {
      const already = await DailyNotification.findOne({
        userId: user._id,
        date: dateKey,
      }).lean();

      if (already) {
        console.log(`Already notified ${user.mobile} for ${dateKey}`);
        continue;
      }

      // FIX: using user._id directly (no ObjectId error)
      const agg = await Expense.aggregate([
        {
          $match: {
            user_id: user._id,   // FIXED HERE
            createdAt: { $gte: todayStart, $lt: tomorrowStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const total = agg[0] && agg[0].total ? agg[0].total : 0;

      const message = `Hello ${user.name || ""}, don't forget to add your remaining expenses for today (${dateKey}). – MoneyMap`;

      try {
        let recipient = user.mobile;

        // convert to E.164 format for Twilio
        if (/^[0-9]{10}$/.test(recipient)) {
          recipient = "+91" + recipient;
        }

        const res = await sendSMS(recipient, message);
        await DailyNotification.create({ userId: user._id, date: dateKey });

        console.log(
          `SMS sent to ${recipient} (user ${user._id}) amount ₹${total}, sid=${res.sid || ""}`
        );
      } catch (smsErr) {
        console.error(
          `Failed sending to ${user.mobile}:`,
          smsErr?.message || smsErr
        );
      }

      await sleep(throttleMs);
    } catch (userErr) {
      console.error(
        `Error processing user ${user._id}:`,
        userErr?.message || userErr
      );
    }
  }

  console.log("runDailyExpenseSMS completed");
}

module.exports = { runDailyExpenseSMS };

const schedule = "15 10 * * *";

cron.schedule(
  schedule,
  () => {
    console.log("Scheduled dailyExpenseSms triggered at", new Date().toISOString());
    runDailyExpenseSMS().catch((err) =>
      console.error("Scheduled run error:", err)
    );
  },
  { timezone: "Asia/Kolkata" }
);
