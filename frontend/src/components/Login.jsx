// import React, { useState, useContext, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function Login() {
//   const { login, token } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({ email: "", password: "" });
//   const [serverError, setServerError] = useState("");

//   // Redirect if already logged in
//   useEffect(() => {
//     if (token) navigate("/dashboard", { replace: true });
//   }, [token, navigate]);

//   // ✅ Strong password validation
//   const validatePassword = (password) => {
//     const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

//     if (!regex.test(password))
//       return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
//     return "";
//   };

//   // Email validation
//   const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email) ? "" : "Please enter a valid email address";
//   };

//   // Handle input change + live validation
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (name === "email") setErrors({ ...errors, email: validateEmail(value) });
//     if (name === "password") setErrors({ ...errors, password: validatePassword(value) });

//     setServerError("");
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const emailError = validateEmail(formData.email);
//     const passwordError = validatePassword(formData.password);

//     if (emailError || passwordError) {
//       setErrors({ email: emailError, password: passwordError });
//       return;
//     }

//     const payload = { email: formData.email, password: formData.password };

//     try {
//       const res = await fetch("http://localhost:8000/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       let data;
//       const ct = res.headers.get("content-type") || "";
//       if (ct.includes("application/json")) {
//         data = await res.json();
//       } else {
//         const text = await res.text();
//         try {
//           data = JSON.parse(text);
//         } catch {
//           data = { message: text };
//         }
//       }

//       if (!res.ok) {
//         setServerError(data.message || `Error: ${res.status} ${res.statusText}`);
//         return;
//       }

//       if (data.success) {
//         login(data.user, data.token);
//         navigate("/dashboard", { replace: true });
//       } else {
//         setServerError(data.message || "Unknown server response");
//         setFormData({ email: "", password: "" });
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setServerError("Server unreachable. Please try again later.");
//     }
//   };

//   // Input styling
//   const inputStyle = (value, hasError = false) =>
//     `w-full pl-10 pr-3 py-3 rounded-xl bg-white border ${
//       hasError ? "border-red-500" : "border-gray-300"
//     } placeholder-gray-500 focus:outline-none focus:ring-2 ${
//       hasError ? "focus:ring-red-500" : "focus:ring-green-500"
//     } transition font-serif ${
//       value ? "text-black font-semibold" : "text-black"
//     }`;

//   // return (
//   //   <div
//   //     className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
//   //     style={{
//   //       backgroundImage: "url('/images/MoneyMap.png')",
//   //       fontFamily: "'Times New Roman', Times, serif",
//   //     }}
//   //   >
//   //     <style>{`
//   //       /* .login-absolute controls main positioning under the face */
//   //       .login-absolute {
//   //         position: absolute;
//   //         top: 35%;            /* adjust this to nudge up/down */
//   //         right: 20%;          /* adjust this to nudge left/right */
//   //         width: 24rem;        /* ~ w-96 */
//   //         transform: translateY(0);
//   //       }

//   //       /* responsive: on small screens stack normally and center */
//   //       @media (max-width: 900px) {
//   //         .login-absolute {
//   //           position: static;
//   //           width: 90%;
//   //           margin: 2rem auto 0 auto;
//   //           transform: none;
//   //         }
//   //       }

//   //       /* optional fine tuning for very wide screens */
//   //       @media (min-width: 1600px) {
//   //         .login-absolute {
//   //           top: 14%;
//   //           right: 22%;
//   //         }
//   //       }
//   //     `}</style>
//   //     <form
//   //       onSubmit={handleSubmit}
//   //       className="bg-white/80 backdrop-blur-md rounded-2xl p-8 login-absolute"
//   //     >
//   //       <h2 className="text-3xl font-bold mb-6 text-center text-black drop-shadow-sm font-serif">
//   //         Login 💰
//   //       </h2>

//   //       {/* Email */}
//   //       <div className="relative mb-4">
//   //         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
//   //           📧
//   //         </span>
//   //         <input
//   //           type="email"
//   //           name="email"
//   //           placeholder="Email"
//   //           value={formData.email}
//   //           onChange={handleChange}
//   //           required
//   //           className={inputStyle(formData.email, errors.email)}
//   //         />
//   //       </div>

//   //       {/* Password */}
//   //       <div className="relative mb-2">
//   //         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
//   //           🔒
//   //         </span>
//   //         <input
//   //           type="password"
//   //           name="password"
//   //           placeholder="Password"
//   //           value={formData.password}
//   //           onChange={handleChange}
//   //           required
//   //           className={inputStyle(formData.password, errors.password)}
//   //         />
//   //       </div>

//   //       {/* Error message */}
//   //       {(errors.email || errors.password || serverError) && (
//   //         <p className="text-red-500 text-sm mb-4">
//   //           {errors.email || errors.password || serverError}
//   //         </p>
//   //       )}

//   //       {/* Submit */}
//   //       <button
//   //         type="submit"
//   //         className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition font-serif"
//   //       >
//   //         Login
//   //       </button>

//   //       {/* Links */}
//   //       <div className="mt-6 flex justify-between text-sm text-gray-700 font-serif">
//   //         <Link to="/forgot" className="hover:text-green-700 hover:underline">
//   //           Forgot Password?
//   //         </Link>
//   //         <Link to="/register" className="hover:text-green-700 hover:underline">
//   //           Create Account
//   //         </Link>
//   //       </div>
//   //     </form>
//   //   </div>
//   // );
//   return (
//   <div
//     className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 md:px-0"
//     style={{
//       backgroundImage: "url('/images/MoneyMap.png')",
//       fontFamily: "'Times New Roman', Times, serif",
//     }}
//   >
//     <style>{`
//       /* Desktop / default: keep under the face on right side */
//       .login-absolute {
//         position: absolute;
//         top: 35%;
//         right: 20%;
//         width: 24rem;
//         transform: translateY(0);
//       }

//       /* ✅ Mobile & small screens fix */
//       @media (max-width: 900px) {
//         .login-absolute {
//           position: relative;
//           top: auto;
//           right: auto;
//           left: auto;
//           width: 100%;
//           max-width: 24rem;
//           margin: 4rem auto 2rem auto;
//           transform: none;
//         }
//       }

//       /* Optional fine tuning for very large screens */
//       @media (min-width: 1600px) {
//         .login-absolute {
//           top: 14%;
//           right: 22%;
//         }
//       }
//     `}</style>

//     <form
//       onSubmit={handleSubmit}
//       className="bg-white/80 backdrop-blur-md rounded-2xl p-8 login-absolute"
//     >
//       <h2 className="text-3xl font-bold mb-6 text-center text-black drop-shadow-sm font-serif">
//         Login 💰
//       </h2>

//       {/* Email */}
//       <div className="relative mb-4">
//         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
//           📧
//         </span>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//           className={inputStyle(formData.email, errors.email)}
//         />
//       </div>

//       {/* Password */}
//       <div className="relative mb-2">
//         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
//           🔒
//         </span>
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           className={inputStyle(formData.password, errors.password)}
//         />
//       </div>

//       {/* Error message */}
//       {(errors.email || errors.password || serverError) && (
//         <p className="text-red-500 text-sm mb-4">
//           {errors.email || errors.password || serverError}
//         </p>
//       )}

//       {/* Submit */}
//       <button
//         type="submit"
//         className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition font-serif"
//       >
//         Login
//       </button>

//       {/* Links */}
//       <div className="mt-6 flex justify-between text-sm text-gray-700 font-serif">
//         <Link to="/forgot" className="hover:text-green-700 hover:underline">
//           Forgot Password?
//         </Link>
//         <Link to="/register" className="hover:text-green-700 hover:underline">
//           Create Account
//         </Link>
//       </div>
//     </form>
//   </div>
// );

// }


import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  // ⬇️ make sure AuthContext provides user + token + login()
  const { login, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");

  // ✅ Redirect if already logged in (based on role)
  useEffect(() => {
    if (!token) return;

    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  // ✅ Strong password validation
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!regex.test(password))
      return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    return "";
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Please enter a valid email address";
  };

  // Handle input change + live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email")
      setErrors({ ...errors, email: validateEmail(value) });
    if (name === "password")
      setErrors({ ...errors, password: validatePassword(value) });

    setServerError("");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!res.ok) {
        setServerError(
          data.message || `Error: ${res.status} ${res.statusText}`
        );
        return;
      }

      if (data.success) {
        // ⬇️ store user + token in context
        // make sure backend sends data.user.role ("admin" or "user")
        login(data.user, data.token);

        // ⬇️ role-based navigation
        if (data.user?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setServerError(data.message || "Unknown server response");
        setFormData({ email: "", password: "" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setServerError("Server unreachable. Please try again later.");
    }
  };

  // Input styling
  const inputStyle = (value, hasError = false) =>
    `w-full pl-10 pr-3 py-3 rounded-xl bg-white border ${
      hasError ? "border-red-500" : "border-gray-300"
    } placeholder-gray-500 focus:outline-none focus:ring-2 ${
      hasError ? "focus:ring-red-500" : "focus:ring-green-500"
    } transition font-serif ${
      value ? "text-black font-semibold" : "text-black"
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 md:px-0"
      style={{
        backgroundImage: "url('/images/MoneyMap.png')",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <style>{`
        /* Desktop / default: keep under the face on right side */
        .login-absolute {
          position: absolute;
          top: 35%;
          right: 20%;
          width: 24rem;
          transform: translateY(0);
        }

        /* ✅ Mobile & small screens fix */
        @media (max-width: 900px) {
          .login-absolute {
            position: relative;
            top: auto;
            right: auto;
            left: auto;
            width: 100%;
            max-width: 24rem;
            margin: 4rem auto 2rem auto;
            transform: none;
          }
        }

        /* Optional fine tuning for very large screens */
        @media (min-width: 1600px) {
          .login-absolute {
            top: 14%;
            right: 22%;
          }
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-8 login-absolute"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-black drop-shadow-sm font-serif">
          Login 💰
        </h2>

        {/* Email */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
            📧
          </span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputStyle(formData.email, errors.email)}
          />
        </div>

        {/* Password */}
        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
            🔒
          </span>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className={inputStyle(formData.password, errors.password)}
          />
        </div>

        {/* Error message */}
        {(errors.email || errors.password || serverError) && (
          <p className="text-red-500 text-sm mb-4">
            {errors.email || errors.password || serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition font-serif"
        >
          Login
        </button>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm text-gray-700 font-serif">
          <Link
            to="/forgot"
            className="hover:text-green-700 hover:underline"
          >
            Forgot Password?
          </Link>
          <Link
            to="/register"
            className="hover:text-green-700 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}
