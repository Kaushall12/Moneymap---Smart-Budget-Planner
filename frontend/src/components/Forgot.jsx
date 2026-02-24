import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ✅ Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Invalid email address format";
  };

  // ✅ Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/otp/send-otpForgot", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("OTP sent to your email!");
        setStep(2);
        setError("");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Error sending OTP. Try again later.");
    }
  };

  // ✅ Reset password
  const resetPassword = async (e) => {
    e.preventDefault();

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("Password reset successful! Please login again.");
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setStep(1);
        setError("");
        setPasswordError("");
        navigate("/");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      setError("Error resetting password. Try again later.");
    }
  };

  const inputStyle = (value, hasError = false) =>
    `w-full p-3 rounded-xl bg-white border ${
      hasError ? "border-red-500" : "border-gray-300"
    } placeholder-gray-500 focus:outline-none focus:ring-2 ${
      hasError ? "focus:ring-red-500" : "focus:ring-green-500"
    } transition font-serif ${value ? "text-black font-semibold" : "text-black"}`;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/MoneyMap.png')",
        fontFamily: "'Times New Roman', Times, serif",
      }
    }
    >
      <style>{`
        /* .login-absolute controls main positioning under the face */
        .login-absolute {
          position: absolute;
          top: 35%;            /* adjust this to nudge up/down */
          right: 20%;          /* adjust this to nudge left/right */
          width: 24rem;        /* ~ w-96 */
          transform: translateY(0);
        }

        /* responsive: on small screens stack normally and center */
        @media (max-width: 900px) {
          .login-absolute {
            position: static;
            width: 90%;
            margin: 2rem auto 0 auto;
            transform: none;
          }
        }

        /* optional fine tuning for very wide screens */
        @media (min-width: 1600px) {
          .login-absolute {
            top: 14%;
            right: 22%;
          }
        }
      `}</style>
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 login-absolute">
        <h2 className="text-3xl font-bold mb-6 text-center text-black drop-shadow-sm font-serif">
          Forgot Password 🔑
        </h2>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              className={inputStyle(email, error.toLowerCase().includes("email"))}
            />
            {error && step === 1 && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition font-serif"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className={inputStyle(otp, error.toLowerCase().includes("otp"))}
            />

            {/* ✅ Updated Password Validation Rule */}
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                const value = e.target.value;
                setNewPassword(value);

                // ✅ Real-time validation for new rule
                const regex =
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

                if (!regex.test(value))
                  setPasswordError(
                    "Password must include uppercase, lowercase, number, special character and be at least 8 characters long"
                  );
                else setPasswordError("");
              }}
              required
              className={inputStyle(newPassword, passwordError !== "")}
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
              className={inputStyle(confirmPassword, error.toLowerCase().includes("match"))}
            />

            {error && step === 2 && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition font-serif"
            >
              Reset Password
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-700 hover:text-green-700 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
