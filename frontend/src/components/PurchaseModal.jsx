import React, { useState } from "react";

export default function PurchaseModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  async function loadRazorpayScript() {
    if (window.Razorpay) return true;
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Razorpay SDK failed to load."));
      document.body.appendChild(s);
    });
  }

  async function handleBuy() {
    // ✅ Get user from localStorage first
    const authUserRaw = localStorage.getItem("authUser");
    const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    const userEmail = authUser?.email;

    if (!userEmail) {
      alert("Please log in before purchasing.");
      return;
    }

    // ✅ Extra safety: if already Pro, do NOT allow repurchase
    if (authUser?.isPro) {
      alert("You already have Pro. Thank you!");
      onClose();
      return;
    }

    try {
      setLoading(true);

      // create order
      const createRes = await fetch(
        "http://localhost:8000/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 49900 }), // ₹499 => 49900 paise
        }
      );
      const createData = await createRes.json();
      if (!createRes.ok)
        throw new Error(createData.message || "Failed to create order");

      await loadRazorpayScript();

      const options = {
        key: createData.key_id,
        amount: createData.order.amount,
        currency: createData.order.currency,
        name: "Money Map",
        description: "Pro Feature Purchase",
        order_id: createData.order.id,
        prefill: { email: userEmail },
        handler: async function (razorpayResponse) {
          try {
            const verifyRes = await fetch(
              "http://localhost:8000/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...razorpayResponse,
                  email: userEmail,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(verifyData.message || "Verification failed");

            if (verifyData && verifyData.user) {
              // ✅ Save updated user with isPro: true to localStorage
              localStorage.setItem(
                "authUser",
                JSON.stringify(verifyData.user)
              );
            } else {
              console.warn("verify did not return updated user");
            }

            alert("Payment successful and verified. You are now Pro!");
            onClose();
            // reload so any context/header etc. reads updated authUser
            window.location.reload();
          } catch (err) {
            console.error("Verification error:", err);
            alert(
              "Payment succeeded but verification failed: " +
                (err.message || "")
            );
            onClose();
          }
        },
        modal: {
          ondismiss: function () {},
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Purchase error: " + (err.message || "Check console"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-3">Purchase Pro Feature</h2>
        <p className="mb-4">
          Unlock premium features with a one-time purchase of ₹499.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            {loading ? "Processing..." : "Buy ₹499"}
          </button>
        </div>
      </div>
    </div>
  );
}
