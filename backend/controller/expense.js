// controller/expense.js
const ExpenseModel = require("../models/expense");
const BudgetModel = require("../models/budget");
const UserModel = require("../models/register");
const { computeBudgetSummary } = require("./budget");
const mongoose = require("mongoose");
const twilio = require("twilio");
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
const TWILIO_FROM = process.env.TWILIO_FROM; // e.g. "+1XXXXXXXXXX" or "+91XXXXXXXXXX" // recommended
const SMS_COOLDOWN_HOURS = process.env.SMS_COOLDOWN_HOURS;

let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} else {
  console.warn("Twilio credentials missing; SMS will not be sent");
}

// Convert Indian-style numbers to E.164 (+91...)
function normalizeToE164(mobile, defaultCountryPrefix = "+91") {
  if (!mobile) return null;
  let m = String(mobile).trim();
  m = m.replace(/[\s\-()]/g, "");
  if (m.startsWith("+")) return m;
  if (m.startsWith("0")) m = m.slice(1);
  if (/^[0-9]{10}$/.test(m)) return `${defaultCountryPrefix}${m}`;
  if (/^[0-9]{11,15}$/.test(m)) return `+${m}`;
  return null;
}

// POST /expense
async function expense(req, res) {
  try {
    // Accept either authenticated user (req.user) or user_id in body
    const authUser = req.user || null;
    const bodyUserId = req.body.user_id || null;
    const userId =
      authUser && authUser._id ? String(authUser._id) : bodyUserId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID missing (provide via auth or user_id)",
      });
    }

    const { amount, date, category, description } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category missing" });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res
        .status(400)
        .json({ message: "Amount missing or invalid" });
    }

    // Determine month/year for budget
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    // ---- SUMMARY BEFORE THIS EXPENSE ----
    const beforeResult = await computeBudgetSummary(userId, year, month);
    const beforeSummary = beforeResult.summary || {};
    const beforeLimit = Number(beforeSummary.overallLimit || 0);
    const beforeSpent = Number(beforeSummary.overallSpent || 0);

    // ---- SAVE EXPENSE ----
    const newExpense = await ExpenseModel.create({
      user_id: userId,
      amount: Number(amount),
      date: d,
      category,
      description: description || "",
    });

    // ---- SUMMARY AFTER THIS EXPENSE ----
    const afterResult = await computeBudgetSummary(userId, year, month);
    const afterSummary = afterResult.summary || {};
    const afterLimit = Number(afterSummary.overallLimit || 0);
    const afterSpent = Number(afterSummary.overallSpent || 0);
    const budgetDoc = afterResult.budget || null; // budget for that month (may be null)

    let smsSent = false;
    let smsError = null;

    // Only check alert if:
    // - budget exists
    // - twilio is configured
    // - we actually have a non-zero budget limit
    if (budgetDoc && twilioClient && afterLimit > 0) {
      // Use 'afterLimit' for threshold and 'beforeLimit' for previous percent.
      const beforePercent =
        beforeLimit > 0 ? (beforeSpent / beforeLimit) * 100 : 0;
      const afterPercent = (afterSpent / afterLimit) * 100;

      const crossed80 =
        beforePercent < 80 && afterPercent >= 80; // just crossed 80%

      console.log("DEBUG overall budget 80% check:", {
        userId,
        year,
        month,
        beforeLimit,
        beforeSpent,
        beforePercent: Number(beforePercent.toFixed(2)),
        afterLimit,
        afterSpent,
        afterPercent: Number(afterPercent.toFixed(2)),
        crossed80,
        // notified80Percent: budgetDoc.notified80Percent,
      });

      // Send SMS only once per month when we cross 80%
      if (crossed80) {
        try {
          const user = await UserModel.findById(userId).lean();

          // Change 'user.mobile' to whichever field holds your phone number
          if (!user || !user.mobile) {
            smsError = "User has no mobile number";
          } else {
            const toNumber = normalizeToE164(user.mobile, "+91");
            if (!toNumber) {
              smsError = "Invalid user mobile format";
            } else {
              const remaining = afterLimit - afterSpent;

              const messageBody = `Alert: You have used ${Math.round(
                afterPercent
              )}% of your monthly budget for ${month}/${year}.
              Budget: ₹${afterLimit}
              Spent: ₹${afterSpent}
              Remaining: ₹${remaining < 0 ? 0 : remaining}.`;

              // Build params (prefer messaging service if provided)
              const msgParams = { body: messageBody, to: toNumber };
              if (TWILIO_MESSAGING_SERVICE_SID) {
                msgParams.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
              } else if (TWILIO_FROM) {
                msgParams.from = TWILIO_FROM;
              } else {
                throw new Error(
                  "No TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM provided"
                );
              }

              const sent = await twilioClient.messages.create(msgParams);
              console.log("Twilio sent message sid:", sent && sent.sid);
              smsSent = true;

              // Mark this budget as notified so we don't send again
              await BudgetModel.updateOne(
                { _id: budgetDoc._id }
                //{ $set: { notified80Percent: true } }
              );
            }
          }
        } catch (err) {
          console.error("SMS send error:", err);
          if (err && err.code) {
            smsError = `Twilio error ${err.code}: ${err.message || err}`;
          } else {
            smsError = err.message || String(err);
          }
        }
      }
    }

    // Helper flags for frontend
    const hasOverall =
      typeof afterSummary.overallLimit === "number" &&
      typeof afterSummary.overallSpent === "number" &&
      afterSummary.overallLimit > 0;

    const overBudget =
      hasOverall && afterSummary.overallSpent > afterSummary.overallLimit;

    const remainingBudget = hasOverall
      ? afterSummary.overallLimit - afterSummary.overallSpent
      : null;

    return res.status(201).json({
      message: "Expense added",
      expense: newExpense,

      // keep both if you need them
      summaryBefore: beforeSummary,
      summaryAfter: afterSummary,

      // 👇 convenient alias for frontend
      summary: afterSummary,

      // 👇 helper fields
      overBudget,
      remainingBudget,

      smsSent,
      smsError,
    });

  } catch (err) {
    console.error("Add expense error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /expense?user_id=...
async function displayexpense(req, res) {
  try {
    const { user_id } = req.query;
    let expenses = [];
    if (user_id) {
      expenses = await ExpenseModel.find({ user_id }).sort({ date: -1 });
    }
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expense" });
  }
}

async function uploadBill(req, res) {
  try {
    const authUser = req.user || null;
    const bodyUserId = req.body.user_id || null;
    const userId =
      authUser && authUser._id ? String(authUser._id) : bodyUserId;

    if (!userId) {
      return res.status(400).json({
        message: "User ID missing (provide via auth or user_id)",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Bill file is required" });
    }

    const billPath = req.file.path;

    // 1) OCR with tesseract.js
    const {
      data: { text },
    } = await Tesseract.recognize(billPath, "eng");

    console.log("==== OCR TEXT START ====");
    console.log(text);
    console.log("==== OCR TEXT END ====");

    const lowerText = text.toLowerCase();

    let amount = null;

    // 2) STEP 1: look at the line that contains "TOTAL" / "GRAND TOTAL"
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (/(grand\s+total|total\s+amount|total)/i.test(line)) {
        const numsInLine = line.match(/([\d.,]{2,})/g); // all numeric pieces
        if (numsInLine && numsInLine.length > 0) {
          // usually the LAST number in that line is the total
          const last = numsInLine[numsInLine.length - 1];
          const parsed = parseFloat(last.replace(/,/g, ""));
          if (!isNaN(parsed) && parsed > 0) {
            amount = parsed;
            break;
          }
        }
      }
    }

    // 3) STEP 2: if still no amount, try whole text with "Total"/"Amount" pattern
    if (!amount || isNaN(amount)) {
      let amountMatch =
        text.match(/total\s*[:\-]?\s*₹?\s*([\d,]+(\.\d+)?)/i) ||
        text.match(/amount\s*[:\-]?\s*₹?\s*([\d,]+(\.\d+)?)/i);

      if (amountMatch && amountMatch[1]) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ""));
      }
    }

    // 4) STEP 3: fallback – pick the largest number in the entire bill
    if (!amount || isNaN(amount)) {
      const allNumberMatches = [...text.matchAll(/([\d,]{2,}(\.\d+)?)/g)];
      if (allNumberMatches.length > 0) {
        let max = 0;
        for (const m of allNumberMatches) {
          const num = parseFloat(m[1].replace(/,/g, ""));
          if (!isNaN(num) && num > max) max = num;
        }
        if (max > 0) amount = max;
      }
    }

    if (!amount || isNaN(amount)) {
      await fs.unlink(billPath).catch(() => { });
      return res.status(400).json({
        message:
          "Could not detect total amount from bill. Try another image or enter amount manually.",
        rawText: text,
      });
    }

    // 5) Detect category
    let category = "Other";

    if (
      lowerText.includes("grocery") ||
      lowerText.includes("supermarket") ||
      lowerText.includes("mart") ||
      lowerText.includes("vegetable")
    ) {
      category = "Grocery";
    } else if (
      lowerText.includes("electricity") ||
      lowerText.includes("power") ||
      lowerText.includes("bijli") ||
      lowerText.includes("energy")
    ) {
      category = "Electricity";
    } else if (
      lowerText.includes("mobile") ||
      lowerText.includes("recharge") ||
      lowerText.includes("data pack")
    ) {
      category = "Mobile Recharge";
    } else if (
      lowerText.includes("internet") ||
      lowerText.includes("broadband") ||
      lowerText.includes("wifi")
    ) {
      category = "Internet";
    } else if (
      lowerText.includes("restaurant") ||
      lowerText.includes("food") ||
      lowerText.includes("swiggy") ||
      lowerText.includes("zomato") ||
      lowerText.includes("hotel")
    ) {
      category = "Food";
    }

    // 6) Save expense
    const expense = await ExpenseModel.create({
      user_id: userId,
      category,
      amount,
      description: "Bill upload (Pro feature)",
      date: new Date(),
    });

    // 7) Delete temp file
    await fs.unlink(billPath).catch(() => { });

    return res.status(201).json({
      message: "Bill processed and expense saved",
      category,
      amount,
      expense,
    });
  } catch (err) {
    console.error("uploadBill error:", err);
    return res.status(500).json({
      message: "Server error processing bill",
      error: err.message || String(err),
    });
  }
}

module.exports = { expense, displayexpense, uploadBill };
