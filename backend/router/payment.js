// DASHBOARD/router/payment.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/register");

const key_id = process.env.key_id;
const key_secret = process.env.key_secret;

const razor = new Razorpay({
  key_id,
  key_secret,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "amount is required (in paise)" });

    const options = {
      amount: parseInt(amount, 10),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razor.orders.create(options);
    return res.json({ order, key_id });
  } catch (err) {
    console.error("create-order err:", err);
    return res.status(500).json({ message: "Server error creating order", error: err.message });
  }
});

// ----------------- VERIFY PAYMENT + UPDATE USER -----------------
router.post("/verify", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      email    // <-- EMAIL COMING FROM FRONTEND
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to activate Pro" });
    }

    // validate signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ ok: false, message: "Invalid signature" });
    }

    // signature valid → now update user based on email
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { 
        isPro: true,
        lastPayment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString(),
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // success response
    return res.json({
      ok: true,
      message: "Payment verified & Pro activated",
      user: updatedUser
    });

  } catch (err) {
    console.error("verify err:", err);
    return res.status(500).json({ message: "Server error verifying payment", error: err.message });
  }
});

module.exports = router;
