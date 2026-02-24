// import React, { useContext, useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Tooltip } from "recharts";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const CATEGORIES = [
//   "Freelance",
//   "Business",
//   "Investment",
//   "Commission",
//   "Rental",
//   "Pension",
//   "Others",
// ];

// const CATEGORY_COLORS = {
//   Freelance: "#3B82F6",
//   Business: "#EF4444",
//   Investment: "#F59E0B",
//   Commission: "#22C55E",
//   Rental: "#8B5CF6",
//   Pension: "#06B6D4",
//   Others: "#F97316",
// };

// export default function Dashboard() {
//   const { token, user } = useContext(AuthContext); // use user from context
//   const navigate = useNavigate();

//   // Set this to your backend origin if backend runs on different port
//   const BASE_URL = "http://localhost:8000";

//   const [month, setMonth] = useState(() => {
//     const d = new Date();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     return `${d.getFullYear()}-${mm}`;
//   });

//   const [income, setIncome] = useState(0);
//   const [expensesByCategory, setExpensesByCategory] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const stored = token || localStorage.getItem("authToken");
//     if (!stored) navigate("/", { replace: true });
//   }, [token, navigate]);

//   // helper: get user id (Mongo _id) from context.user or localStorage.authUser
//   function getUserIdFromClient() {
//     // prefer context user
//     if (user && (user._id || user.id)) return String(user._id ?? user.id);
//     // fallback to localStorage (AuthContext stores authUser)
//     try {
//       const saved = localStorage.getItem("authUser");
//       if (!saved) return null;
//       const parsed = JSON.parse(saved);
//       if (parsed && (parsed._id || parsed.id)) return String(parsed._id ?? parsed.id);
//     } catch (e) {
//       // ignore parse errors
//     }
//     return null;
//   }

//   useEffect(() => {
//     const controller = new AbortController();
//     const rawToken = token || localStorage.getItem("authToken") || "";
//     const userIdForQuery = getUserIdFromClient();

//     async function fetchJsonWithCheck(url, opts = {}) {
//       const res = await fetch(url, { ...opts, signal: controller.signal });
//       const ct = (res.headers.get("content-type") || "").toLowerCase();
//       const clone = res.clone();

//       if (!res.ok) {
//         let body = "";
//         try { body = await clone.text(); } catch (e) { body = "<unreadable>"; }
//         throw new Error(`Request failed ${res.status} ${res.statusText} — body snippet: ${String(body).slice(0, 1200)}`);
//       }

//       if (ct.includes("application/json") || ct.includes("json")) return res.json();
//       const text = await clone.text();
//       if (!text || !text.trim()) throw new Error("Expected JSON but received empty body.");
//       if (text.trim()[0] === "<") {
//         throw new Error(`Expected JSON but received HTML. Response snippet: ${text.slice(0, 1200)}`);
//       }
//       try { return JSON.parse(text); } catch (e) {
//         throw new Error(`Expected JSON but received non-JSON text. Snippet: ${text.slice(0, 1200)}`);
//       }
//     }

//     async function fetchData() {
//       setLoading(true);
//       setError(null);
//       try {
//         if (!userIdForQuery) {
//           throw new Error("user_id not available. Ensure the login stores the user object (with _id) in AuthContext/localStorage.");
//         }

//         const headers = { "Content-Type": "application/json" };
//         if (rawToken) headers["x-auth-token"] = rawToken;

//         const q = `?month=${encodeURIComponent(month)}&user_id=${encodeURIComponent(userIdForQuery)}`;

//         const incomeUrl = `${BASE_URL}/monthly/income${q}`;
//         const expenseUrl = `${BASE_URL}/monthly/expense${q}`;

//         const incomeJson = await fetchJsonWithCheck(incomeUrl, { headers });
//         const incomeValue = Number(incomeJson.income ?? incomeJson.total ?? 0);
//         setIncome(Number.isFinite(incomeValue) ? incomeValue : 0);

//         const expJson = await fetchJsonWithCheck(expenseUrl, { headers });

//         let normalized = {};
//         if (Array.isArray(expJson)) {
//           expJson.forEach((it) => {
//             const key = it.category ?? it._id ?? it.name;
//             const val = Number(it.total ?? it.value ?? it.amount ?? 0);
//             if (key) normalized[key] = (normalized[key] || 0) + (Number.isFinite(val) ? val : 0);
//           });
//         } else if (expJson && typeof expJson === "object") {
//           if (expJson.categories && typeof expJson.categories === "object") normalized = { ...expJson.categories };
//           else if (Array.isArray(expJson.totals)) expJson.totals.forEach((it) => (normalized[it.category] = Number(it.total || 0)));
//           else normalized = { ...expJson };
//         } else {
//           throw new Error("Expenses endpoint returned unexpected data shape.");
//         }

//         CATEGORIES.forEach((c) => { normalized[c] = Number(normalized[c] ?? 0) || 0; });
//         setExpensesByCategory(normalized);
//       } catch (err) {
//         if (err && err.name === "AbortError") return; // ignore aborts
//         console.error("Dashboard fetch error:", err);
//         setError(err.message || String(err));
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     }

//     fetchData();
//     return () => controller.abort();
//   }, [month, token, user]); // re-run when user changes

//   const totalExpense = Object.values(expensesByCategory).reduce((s, v) => s + Number(v || 0), 0);
//   const savings = Number(income || 0) - totalExpense;

//   const pieData = CATEGORIES.map((cat) => ({ name: cat, value: Number(expensesByCategory[cat] || 0), color: CATEGORY_COLORS[cat] })).filter(d => d.value > 0);

//   // return (
//   //   <div className="flex min-h-screen bg-gray-100">
//   //     <main className="flex-1 p-8">
//   //       <div className="flex justify-between items-center mb-6">
//   //         <h1 className="text-3xl font-bold text-slate-800">Money Map System</h1>
//   //         <div className="flex items-center gap-3">
//   //           <label className="text-sm text-slate-600">Month</label>
//   //           <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded px-2 py-1" />
//   //         </div>
//   //       </div>

//   //       {loading ? <div className="p-6 bg-white rounded-2xl border text-center">Loading...</div> :
//   //         error ? (
//   //           <div className="p-6 bg-white rounded-2xl border text-center text-red-600">
//   //             <strong>Error:</strong> {error}
//   //             <div className="mt-2 text-xs text-slate-500">Make sure login stores the user object (with _id) in AuthContext.login(userData, token) so Dashboard can read it.</div>
//   //           </div>
//   //         ) : (
//   //           <>
//   //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//   //               <div className="rounded-2xl border border-gray-200 bg-white shadow p-6">
//   //                 <h2 className="text-xl font-semibold text-center mb-4">Expense Distribution</h2>
//   //                 <div className="flex justify-center">
//   //                   {pieData.length > 0 ? (
//   //                     <PieChart width={360} height={260}>
//   //                       <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={(entry) => `${entry.name} (${entry.value})`}>
//   //                         {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
//   //                       </Pie>
//   //                       <Tooltip />
//   //                     </PieChart>
//   //                   ) : <div className="text-slate-600">No expenses recorded this month</div>}
//   //                 </div>

//   //                 <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
//   //                   {CATEGORIES.map((c) => (
//   //                     <div key={c} className="flex items-center gap-2">
//   //                       <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[c] }} />
//   //                       <span className="text-slate-700">{c}: {Number(expensesByCategory[c] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
//   //                     </div>
//   //                   ))}
//   //                 </div>
//   //               </div>

//   //               <div className="rounded-2xl border border-gray-200 bg-white shadow p-6">
//   //                 <h2 className="text-xl font-semibold text-center mb-4">Last Month's Income and Expenses</h2>
//   //                 <table className="w-full text-sm">
//   //                   <thead><tr className="text-slate-500"><th className="text-left border-b py-2">Category</th><th className="text-right border-b py-2">Amount</th></tr></thead>
//   //                   <tbody className="text-slate-700">
//   //                     <Row name="Income (total for month)" amount={income} />
//   //                     {CATEGORIES.map(c => <Row key={c} name={c} amount={expensesByCategory[c] ?? 0} />)}
//   //                     <tr className="font-semibold"><td className="py-2">Total Expense</td><td className="py-2 text-right">{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
//   //                     <tr className="font-semibold"><td className="py-2">Savings</td><td className={`py-2 text-right ${savings < 0 ? "text-red-600" : "text-slate-900"}`}>{savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
//   //                   </tbody>
//   //                 </table>
//   //               </div>
//   //             </div>

//   //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//   //               <StatCard title="Income (month)" amount={income} />
//   //               <StatCard title="Total Expense" amount={totalExpense} />
//   //               <StatCard title="Savings" amount={savings} />
//   //             </div>
//   //           </>
//   //         )}
//   //     </main>
//   //   </div>
//   // );
//       return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 overflow-x-hidden">
//       <main className="flex-1 p-4 md:p-6 lg:p-8">
//         {/* ✅ Mobile-only CSS, laptop unchanged */}
//         <style>{`
//           @media (max-width: 768px) {
//             .dashboard-header {
//               flex-direction: column;
//               align-items: flex-start;
//               gap: 0.75rem;
//             }

//             .dashboard-title {
//               font-size: 1.5rem;
//             }

//             .dashboard-month {
//               width: 100%;
//               justify-content: space-between;
//             }

//             .dashboard-month input[type="month"] {
//               width: 60%;
//             }

//             .pie-chart-inner {
//               transform: scale(0.85);
//               transform-origin: center;
//             }
//           }

//           @media (max-width: 400px) {
//             .pie-chart-inner {
//               transform: scale(0.75);
//               transform-origin: center;
//             }
//           }
//         `}</style>

//         <div className="flex justify-between items-center mb-6 dashboard-header">
//           <h1 className="text-3xl font-bold text-slate-800 dashboard-title">
//             Money Map System
//           </h1>
//           <div className="flex items-center gap-3 dashboard-month">
//             <label className="text-sm text-slate-600">Month</label>
//             <input
//               type="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               className="border rounded px-2 py-1"
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-6 bg-white rounded-2xl border text-center">
//             Loading...
//           </div>
//         ) : error ? (
//           <div className="p-6 bg-white rounded-2xl border text-center text-red-600">
//             <strong>Error:</strong> {error}
//             <div className="mt-2 text-xs text-slate-500">
//               Make sure login stores the user object (with _id) in
//               AuthContext.login(userData, token) so Dashboard can read it.
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="rounded-2xl border border-gray-200 bg-white shadow p-6">
//                 <h2 className="text-xl font-semibold text-center mb-4">
//                   Expense Distribution
//                 </h2>
//                 <div className="flex justify-center">
//                   {pieData.length > 0 ? (
//                     <div className="pie-chart-inner">
//                       <PieChart width={360} height={260}>
//                         <Pie
//                           data={pieData}
//                           dataKey="value"
//                           nameKey="name"
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={95}
//                           label={(entry) => `${entry.name} (${entry.value})`}
//                         >
//                           {pieData.map((d, i) => (
//                             <Cell key={i} fill={d.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </div>
//                   ) : (
//                     <div className="text-slate-600">
//                       No expenses recorded this month
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
//                   {CATEGORIES.map((c) => (
//                     <div key={c} className="flex items-center gap-2">
//                       <span
//                         className="inline-block h-3 w-3 rounded-sm"
//                         style={{ backgroundColor: CATEGORY_COLORS[c] }}
//                       />
//                       <span className="text-slate-700">
//                         {c}:{" "}
//                         {Number(
//                           expensesByCategory[c] ?? 0
//                         ).toLocaleString(undefined, {
//                           maximumFractionDigits: 2,
//                         })}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="rounded-2xl border border-gray-200 bg-white shadow p-6">
//                 <h2 className="text-xl font-semibold text-center mb-4">
//                   Last Month&apos;s Income and Expenses
//                 </h2>
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="text-slate-500">
//                       <th className="text-left border-b py-2">Category</th>
//                       <th className="text-right border-b py-2">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-slate-700">
//                     <Row name="Income (total for month)" amount={income} />
//                     {CATEGORIES.map((c) => (
//                       <Row
//                         key={c}
//                         name={c}
//                         amount={expensesByCategory[c] ?? 0}
//                       />
//                     ))}
//                     <tr className="font-semibold">
//                       <td className="py-2">Total Expense</td>
//                       <td className="py-2 text-right">
//                         {totalExpense.toLocaleString(undefined, {
//                           maximumFractionDigits: 2,
//                         })}
//                       </td>
//                     </tr>
//                     <tr className="font-semibold">
//                       <td className="py-2">Savings</td>
//                       <td
//                         className={`py-2 text-right ${
//                           savings < 0 ? "text-red-600" : "text-slate-900"
//                         }`}
//                       >
//                         {savings.toLocaleString(undefined, {
//                           maximumFractionDigits: 2,
//                         })}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//               <StatCard title="Income (month)" amount={income} />
//               <StatCard title="Total Expense" amount={totalExpense} />
//               <StatCard title="Savings" amount={savings} />
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

// function Row({ name, amount }) {
//   const formatted = typeof amount === "number" ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : amount;
//   return (<tr><td className="py-2 border-b">{name}</td><td className="py-2 border-b text-right">{formatted}</td></tr>);
// }

// function StatCard({ title, amount }) {
//   const display = typeof amount === "number" ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : amount;
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white shadow p-6 text-center">
//       <p className="text-lg font-semibold text-slate-700">{title}</p>
//       <p className="text-3xl font-bold text-slate-900 mt-2">{display}</p>
//     </div>
//   );
// }

// import React, { useContext, useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Tooltip } from "recharts";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// // Known expense categories from your Expense page
// // <option value="Food">Food</option> etc.
// const CATEGORY_COLORS = {
//   Food: "#3B82F6",
//   Travel: "#EF4444",
//   Shopping: "#F59E0B",
//   Bills: "#22C55E",
//   Rent: "#8B5CF6",
//   Medical: "#06B6D4",
//   Others: "#F97316",
// };

// // Fallback colors if backend returns any extra category names
// const FALLBACK_COLORS = [
//   "#0ea5e9",
//   "#22c55e",
//   "#f97316",
//   "#6366f1",
//   "#14b8a6",
//   "#e11d48",
//   "#a855f7",
// ];

// export default function Dashboard() {
//   const { token, user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const BASE_URL = "http://localhost:8000";

//   const [month, setMonth] = useState(() => {
//     const d = new Date();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     return `${d.getFullYear()}-${mm}`;
//   });

//   const [income, setIncome] = useState(0);
//   const [expensesByCategory, setExpensesByCategory] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // redirect if no token
//   useEffect(() => {
//     const stored = token || localStorage.getItem("authToken");
//     if (!stored) navigate("/", { replace: true });
//   }, [token, navigate]);

//   function getUserIdFromClient() {
//     if (user && (user._id || user.id)) return String(user._id ?? user.id);
//     try {
//       const saved = localStorage.getItem("authUser");
//       if (!saved) return null;
//       const parsed = JSON.parse(saved);
//       if (parsed && (parsed._id || parsed.id))
//         return String(parsed._id ?? parsed.id);
//     } catch (e) {}
//     return null;
//   }

//   useEffect(() => {
//     const controller = new AbortController();
//     const rawToken = token || localStorage.getItem("authToken") || "";
//     const userIdForQuery = getUserIdFromClient();

//     async function fetchJsonWithCheck(url, opts = {}) {
//       const res = await fetch(url, { ...opts, signal: controller.signal });
//       const ct = (res.headers.get("content-type") || "").toLowerCase();
//       const clone = res.clone();

//       if (!res.ok) {
//         let body = "";
//         try {
//           body = await clone.text();
//         } catch (e) {
//           body = "<unreadable>";
//         }
//         throw new Error(
//           `Request failed ${res.status} ${res.statusText} — body snippet: ${String(
//             body
//           ).slice(0, 1200)}`
//         );
//       }

//       if (ct.includes("application/json") || ct.includes("json"))
//         return res.json();
//       const text = await clone.text();
//       if (!text || !text.trim())
//         throw new Error("Expected JSON but received empty body.");
//       if (text.trim()[0] === "<") {
//         throw new Error(
//           `Expected JSON but received HTML. Response snippet: ${text.slice(
//             0,
//             1200
//           )}`
//         );
//       }
//       try {
//         return JSON.parse(text);
//       } catch (e) {
//         throw new Error(
//           `Expected JSON but received non-JSON text. Snippet: ${text.slice(
//             0,
//             1200
//           )}`
//         );
//       }
//     }

//     async function fetchData() {
//       setLoading(true);
//       setError(null);
//       try {
//         if (!userIdForQuery) {
//           throw new Error(
//             "user_id not available. Ensure the login stores the user object (with _id) in AuthContext/localStorage."
//           );
//         }

//         const headers = { "Content-Type": "application/json" };
//         if (rawToken) headers["x-auth-token"] = rawToken;

//         const q = `?month=${encodeURIComponent(
//           month
//         )}&user_id=${encodeURIComponent(userIdForQuery)}`;

//         const incomeUrl = `${BASE_URL}/monthly/income${q}`;
//         const expenseUrl = `${BASE_URL}/monthly/expense${q}`;

//         const incomeJson = await fetchJsonWithCheck(incomeUrl, { headers });
//         const incomeValue = Number(incomeJson.income ?? incomeJson.total ?? 0);
//         setIncome(Number.isFinite(incomeValue) ? incomeValue : 0);

//         const expJson = await fetchJsonWithCheck(expenseUrl, { headers });

//         let normalized = {};
//         if (Array.isArray(expJson)) {
//           // e.g. [{category:"Food", total: 500}, ...]
//           expJson.forEach((it) => {
//             const key = it.category ?? it._id ?? it.name;
//             const val = Number(it.total ?? it.value ?? it.amount ?? 0);
//             if (key)
//               normalized[key] =
//                 (normalized[key] || 0) + (Number.isFinite(val) ? val : 0);
//           });
//         } else if (expJson && typeof expJson === "object") {
//           if (expJson.categories && typeof expJson.categories === "object")
//             normalized = { ...expJson.categories };
//           else if (Array.isArray(expJson.totals))
//             expJson.totals.forEach(
//               (it) => (normalized[it.category] = Number(it.total || 0))
//             );
//           else normalized = { ...expJson };
//         } else {
//           throw new Error("Expenses endpoint returned unexpected data shape.");
//         }

//         setExpensesByCategory(normalized || {});
//       } catch (err) {
//         if (err && err.name === "AbortError") return;
//         console.error("Dashboard fetch error:", err);
//         setError(err.message || String(err));
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     }

//     fetchData();
//     return () => controller.abort();
//   }, [month, token, user]); // re-run when user changes

//   // ---------- Derived values ----------
//   const categoryNames = Object.keys(expensesByCategory || {}).filter(
//     (name) => name && name !== "null" && name !== "undefined"
//   );

//   const totalExpense = categoryNames.reduce(
//     (sum, name) => sum + Number(expensesByCategory[name] || 0),
//     0
//   );
//   const savings = Number(income || 0) - totalExpense;

//   const pieData = categoryNames
//     .map((name, index) => ({
//       name,
//       value: Number(expensesByCategory[name] || 0),
//       color:
//         CATEGORY_COLORS[name] ||
//         FALLBACK_COLORS[index % FALLBACK_COLORS.length],
//     }))
//     .filter((d) => d.value > 0);

//   const spendingRatio = income > 0 ? Math.min(totalExpense / income, 2) : 0;

//   // ---------- UI ----------
//   return (
//     // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900">
//       <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div>
//             <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//               Money Map Dashboard
//             </div>
//             <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
//               Hello{user?.name ? `, ${user.name}` : ""} 👋
//             </h1>
//             <p className="mt-1 text-sm text-slate-600 md:text-base">
//               Get a clear picture of how your money moves this month.
//             </p>
//           </div>

//           {/* Month selector card */}
//           <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md md:flex-row md:items-center md:gap-3">
//             <div className="flex items-center gap-2 text-xs font-medium text-slate-500 md:text-sm">
//               <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-base">
//                 📅
//               </span>
//               <span className="flex flex-col leading-tight">
//                 <span className="text-slate-800">Selected month</span>
//                 <span className="text-[0.7rem] uppercase tracking-wide text-slate-400">
//                   Change to view another month&apos;s report
//                 </span>
//               </span>
//             </div>
//             <input
//               type="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-emerald-400/40 transition focus:bg-white focus:ring-2 md:mt-0 md:w-auto"
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex flex-1 items-center justify-center">
//             <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-md">
//               <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
//               <p className="text-sm text-slate-600">
//                 Loading your insights…
//               </p>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-center text-sm shadow-md">
//             <p className="font-semibold text-rose-700">
//               <span className="mr-1">⚠️</span>Error
//             </p>
//             <p className="mt-1 text-rose-600">{error}</p>
//             <p className="mt-2 text-xs text-rose-500">
//               Make sure login stores the user object (with <code>_id</code>) in{" "}
//               <code>AuthContext.login(userData, token)</code> so Dashboard can
//               read it.
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Top grid: Pie + Table */}
//             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//               {/* Expense Distribution with labels outside */}
//               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
//                 <div className="mb-4 flex items-center justify-between gap-2">
//                   <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
//                     Expense Distribution
//                   </h2>
//                   <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
//                     By category
//                   </span>
//                 </div>

//                 <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
//                   {/* Pie chart */}
//                   <div className="flex flex-1 justify-center">
//                     {pieData.length > 0 ? (
//                       <PieChart width={260} height={220}>
//                         <Pie
//                           data={pieData}
//                           dataKey="value"
//                           nameKey="name"
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={80}
//                         >
//                           {pieData.map((d, i) => (
//                             <Cell key={i} fill={d.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "#ffffff",
//                             borderRadius: "10px",
//                             border: "1px solid #e5e7eb",
//                             fontSize: "0.75rem",
//                           }}
//                           itemStyle={{ color: "#0f172a" }}
//                         />
//                       </PieChart>
//                     ) : (
//                       <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
//                         No expenses recorded for this month yet.
//                       </div>
//                     )}
//                   </div>

//                   {/* Labels + details outside (only categories with expense > 0) */}
//                   <div className="flex flex-1 flex-col gap-2 text-xs md:text-sm">
//                     <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
//                       Category breakdown
//                     </p>

//                     {pieData.length === 0 ? (
//                       <p className="text-slate-500 text-xs">
//                         Once you add expenses, each category amount will appear
//                         here.
//                       </p>
//                     ) : (
//                       pieData.map((entry, index) => {
//                         const pct =
//                           totalExpense > 0
//                             ? ((entry.value / totalExpense) * 100).toFixed(1)
//                             : 0;
//                         return (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
//                           >
//                             <div className="flex items-center gap-2">
//                               <span
//                                 className="inline-block h-3 w-3 rounded-full"
//                                 style={{ backgroundColor: entry.color }}
//                               />
//                               <span className="text-slate-700 text-sm font-medium">
//                                 {entry.name}
//                               </span>
//                             </div>
//                             <div className="flex flex-col items-end">
//                               <span className="text-slate-900 text-sm font-semibold">
//                                 ₹
//                                 {entry.value.toLocaleString("en-IN", {
//                                   maximumFractionDigits: 2,
//                                 })}
//                               </span>
//                               <span className="text-slate-500 text-[0.7rem]">
//                                 {pct}% of total
//                               </span>
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Income & Expense Table */}
//               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
//                 <div className="mb-4 flex items-center justify-between gap-2">
//                   <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
//                     Monthly Income &amp; Expenses
//                   </h2>
//                 <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
//                     Summary
//                   </span>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="mb-4">
//                   <div className="flex items-center justify-between text-xs text-slate-500">
//                     <span>Spending vs income</span>
//                     <span>
//                       {income > 0
//                         ? `${Math.min(
//                             spendingRatio * 100,
//                             200
//                           ).toFixed(0)}% of income`
//                         : "Add income to track"}
//                     </span>
//                   </div>
//                   <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
//                     <div
//                       className={`h-full rounded-full ${
//                         spendingRatio <= 1
//                           ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
//                           : "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
//                       }`}
//                       style={{ width: `${Math.min(spendingRatio * 100, 200)}%` }}
//                     />
//                   </div>
//                   {spendingRatio > 1 && (
//                     <p className="mt-1 text-xs text-rose-600">
//                       You&apos;re spending more than your income this month.
//                     </p>
//                   )}
//                 </div>

//                 <div className="max-h-72 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60">
//                   <table className="w-full text-xs md:text-sm">
//                     <thead>
//                       <tr className="bg-slate-100 text-slate-600">
//                         <th className="border-b border-slate-200 px-4 py-2 text-left">
//                           Category
//                         </th>
//                         <th className="border-b border-slate-200 px-4 py-2 text-right">
//                           Amount
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="text-slate-800">
//                       <Row
//                         name="Income (total for month)"
//                         amount={income}
//                         highlight
//                       />

//                       {categoryNames.map((name) => (
//                         <Row
//                           key={name}
//                           name={name}
//                           amount={expensesByCategory[name] ?? 0}
//                         />
//                       ))}

//                       <tr className="bg-slate-100 font-semibold text-slate-900">
//                         <td className="px-4 py-2">Total Expense</td>
//                         <td className="px-4 py-2 text-right">
//                           {totalExpense.toLocaleString("en-IN", {
//                             maximumFractionDigits: 2,
//                           })}
//                         </td>
//                       </tr>
//                       <tr
//                         className={`font-semibold ${
//                           savings < 0
//                             ? "bg-rose-50 text-rose-700"
//                             : "bg-emerald-50 text-emerald-700"
//                         }`}
//                       >
//                         <td className="px-4 py-2">Savings</td>
//                         <td className="px-4 py-2 text-right">
//                           {savings.toLocaleString("en-IN", {
//                             maximumFractionDigits: 2,
//                           })}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>

//             {/* Stat cards */}
//             <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
//               <StatCard
//                 title="Income (month)"
//                 amount={income}
//                 subtitle="All money coming in"
//                 badge="IN"
//               />
//               <StatCard
//                 title="Total expense"
//                 amount={totalExpense}
//                 subtitle="What you spent"
//                 badge="OUT"
//               />
//               <StatCard
//                 title="Savings"
//                 amount={savings}
//                 subtitle={
//                   savings < 0 ? "You overspent this month" : "Amount you kept"
//                 }
//                 badge={savings < 0 ? "ALERT" : "SAFE"}
//                 isAlert={savings < 0}
//               />
//             </div>
//           </>
//         )}
//       </main>
//     // </div>
//   );
// }

// function Row({ name, amount, highlight = false }) {
//   const formatted =
//     typeof amount === "number"
//       ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
//       : amount;
//   return (
//     <tr
//       className={
//         highlight
//           ? "bg-slate-50 text-emerald-700"
//           : "border-t border-slate-200"
//       }
//     >
//       <td className="px-4 py-2">{name}</td>
//       <td className="px-4 py-2 text-right">{formatted}</td>
//     </tr>
//   );
// }

// function StatCard({ title, amount, subtitle, badge, isAlert = false }) {
//   const display =
//     typeof amount === "number"
//       ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
//       : amount;

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
//       <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />
//       <div className="mb-3 flex items-center justify-between">
//         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//           {title}
//         </p>
//         <span
//           className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide border ${
//             isAlert
//               ? "bg-rose-50 text-rose-700 border-rose-200"
//               : "bg-emerald-50 text-emerald-700 border-emerald-200"
//           }`}
//         >
//           {badge}
//         </span>
//       </div>
//       <p className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
//         {display}
//       </p>
//       {subtitle && (
//         <p className="mt-2 text-xs text-slate-500 md:text-sm">{subtitle}</p>
//       )}
//     </div>
//   );
// }

import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Known expense categories from your Expense page
const CATEGORY_COLORS = {
  Food: "#3B82F6",
  Travel: "#EF4444",
  Fuel: "#F97316",
  Bills: "#22C55E",
  Rent: "#8B5CF6",
  Medical: "#06B6D4",
  Education: "#0EA5E9",
  Entertainment: "#EC4899",
  Shopping: "#F59E0B",
  Subscriptions: "#6366F1",
  Others: "#94A3B8",
};

// Fallback colors if backend returns any extra category names
const FALLBACK_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#e11d48",
  "#a855f7",
];

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:8000";

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const [income, setIncome] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ NEW: all-months savings from Saving schema
  const [totalActualSaving, setTotalActualSaving] = useState(0);
  const [savingHistory, setSavingHistory] = useState([]); // optional, if you want to use later

  // redirect if no token
  useEffect(() => {
    const stored = token || localStorage.getItem("authToken");
    if (!stored) navigate("/", { replace: true });
  }, [token, navigate]);

  function getUserIdFromClient() {
    if (user && (user._id || user.id)) return String(user._id ?? user.id);
    try {
      const saved = localStorage.getItem("authUser");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && (parsed._id || parsed.id))
        return String(parsed._id ?? parsed.id);
    } catch (e) {}
    return null;
  }

  useEffect(() => {
    const controller = new AbortController();
    const rawToken = token || localStorage.getItem("authToken") || "";
    const userIdForQuery = getUserIdFromClient();

    async function fetchJsonWithCheck(url, opts = {}) {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const clone = res.clone();

      if (!res.ok) {
        let body = "";
        try {
          body = await clone.text();
        } catch (e) {
          body = "<unreadable>";
        }
        throw new Error(
          `Request failed ${res.status} ${res.statusText} — body snippet: ${String(
            body
          ).slice(0, 1200)}`
        );
      }

      if (ct.includes("application/json") || ct.includes("json"))
        return res.json();
      const text = await clone.text();
      if (!text || !text.trim())
        throw new Error("Expected JSON but received empty body.");
      if (text.trim()[0] === "<") {
        throw new Error(
          `Expected JSON but received HTML. Response snippet: ${text.slice(
            0,
            1200
          )}`
        );
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(
          `Expected JSON but received non-JSON text. Snippet: ${text.slice(
            0,
            1200
          )}`
        );
      }
    }

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!userIdForQuery) {
          throw new Error(
            "user_id not available. Ensure the login stores the user object (with _id) in AuthContext/localStorage."
          );
        }

        const headers = { "Content-Type": "application/json" };
        if (rawToken) headers["x-auth-token"] = rawToken;

        const q = `?month=${encodeURIComponent(
          month
        )}&user_id=${encodeURIComponent(userIdForQuery)}`;

        const incomeUrl = `${BASE_URL}/monthly/income${q}`;
        const expenseUrl = `${BASE_URL}/monthly/expense${q}`;

        // ----- Monthly Income -----
        const incomeJson = await fetchJsonWithCheck(incomeUrl, { headers });
        const incomeValue = Number(incomeJson.income ?? incomeJson.total ?? 0);
        setIncome(Number.isFinite(incomeValue) ? incomeValue : 0);

        // ----- Monthly Expenses -----
        const expJson = await fetchJsonWithCheck(expenseUrl, { headers });

        let normalized = {};
        if (Array.isArray(expJson)) {
          // e.g. [{category:"Food", total: 500}, ...]
          expJson.forEach((it) => {
            const key = it.category ?? it._id ?? it.name;
            const val = Number(it.total ?? it.value ?? it.amount ?? 0);
            if (key)
              normalized[key] =
                (normalized[key] || 0) + (Number.isFinite(val) ? val : 0);
          });
        } else if (expJson && typeof expJson === "object") {
          if (expJson.categories && typeof expJson.categories === "object")
            normalized = { ...expJson.categories };
          else if (Array.isArray(expJson.totals))
            expJson.totals.forEach(
              (it) => (normalized[it.category] = Number(it.total || 0))
            );
          else normalized = { ...expJson };
        } else {
          throw new Error("Expenses endpoint returned unexpected data shape.");
        }

        setExpensesByCategory(normalized || {});

        // ✅ NEW: Fetch ALL-MONTH SAVINGS for this user
        const savingUrl = `${BASE_URL}/saving?user_id=${encodeURIComponent(
          userIdForQuery
        )}`;
        const savingJson = await fetchJsonWithCheck(savingUrl, { headers });
        // expecting: { success, totalActualSaving, savings: [...] }
        if (savingJson && typeof savingJson === "object") {
          setTotalActualSaving(
            Number(savingJson.totalActualSaving || 0) || 0
          );
          setSavingHistory(Array.isArray(savingJson.savings) ? savingJson.savings : []);
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
        console.error("Dashboard fetch error:", err);
        setError(err.message || String(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [month, token, user]); // re-run when user changes

  // ---------- Derived values ----------
  const categoryNames = Object.keys(expensesByCategory || {}).filter(
    (name) => name && name !== "null" && name !== "undefined"
  );

  const totalExpense = categoryNames.reduce(
    (sum, name) => sum + Number(expensesByCategory[name] || 0),
    0
  );
  // Monthly saving = income - expense (current month)
  const savings = Number(income || 0) - totalExpense;

  const pieData = categoryNames
    .map((name, index) => ({
      name,
      value: Number(expensesByCategory[name] || 0),
      color:
        CATEGORY_COLORS[name] ||
        FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    .filter((d) => d.value > 0);

  const spendingRatio = income > 0 ? Math.min(totalExpense / income, 2) : 0;

  // ---------- UI ----------
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Money Map Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Hello{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600 md:text-base">
            Get a clear picture of how your money moves this month.
          </p>
        </div>

        {/* Month selector card */}
        <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md md:flex-row md:items-center md:gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 md:text-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-base">
              📅
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-slate-800">Selected month</span>
              <span className="text-[0.7rem] uppercase tracking-wide text-slate-400">
                Change to view another month&apos;s report
              </span>
            </span>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none ring-emerald-400/40 transition focus:bg-white focus:ring-2 md:mt-0 md:w-auto"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-md">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <p className="text-sm text-slate-600">Loading your insights…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-center text-sm shadow-md">
          <p className="font-semibold text-rose-700">
            <span className="mr-1">⚠️</span>Error
          </p>
          <p className="mt-1 text-rose-600">{error}</p>
          <p className="mt-2 text-xs text-rose-500">
            Make sure login stores the user object (with <code>_id</code>) in{" "}
            <code>AuthContext.login(userData, token)</code> so Dashboard can
            read it.
          </p>
        </div>
      ) : (
        <>
          {/* Top grid: Pie + Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Expense Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                  Expense Distribution
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  By category
                </span>
              </div>

              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                {/* Pie chart */}
                <div className="flex flex-1 justify-center">
                  {pieData.length > 0 ? (
                    <PieChart width={260} height={220}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {pieData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.75rem",
                        }}
                        itemStyle={{ color: "#0f172a" }}
                      />
                    </PieChart>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      No expenses recorded for this month yet.
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-1 flex-col gap-2 text-xs md:text-sm
                max-h-64 overflow-y-auto pr-2 scrollbar-thin
                scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Category breakdown
                  </p>

                  {pieData.length === 0 ? (
                    <p className="text-slate-500 text-xs">
                      Once you add expenses, each category amount will appear
                      here.
                    </p>
                  ) : (
                    pieData.map((entry, index) => {
                      const pct =
                        totalExpense > 0
                          ? ((entry.value / totalExpense) * 100).toFixed(1)
                          : 0;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-700 text-sm font-medium">
                              {entry.name}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-slate-900 text-sm font-semibold">
                              ₹
                              {entry.value.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-slate-500 text-[0.7rem]">
                              {pct}% of total
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Income & Expense Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                  Monthly Income &amp; Expenses
                </h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  Summary
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Spending vs income</span>
                  <span>
                    {income > 0
                      ? `${Math.min(
                          spendingRatio * 100,
                          200
                        ).toFixed(0)}% of income`
                      : "Add income to track"}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      spendingRatio <= 1
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
                    }`}
                    style={{
                      width: `${Math.min(spendingRatio * 100, 200)}%`,
                    }}
                  />
                </div>
                {spendingRatio > 1 && (
                  <p className="mt-1 text-xs text-rose-600">
                    You&apos;re spending more than your income this month.
                  </p>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 pr-2">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="border-b border-slate-200 px-4 py-2 text-left">
                        Category
                      </th>
                      <th className="border-b border-slate-200 px-4 py-2 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-800">
                    <Row
                      name="Income (total for month)"
                      amount={income}
                      highlight
                    />

                    {categoryNames.map((name) => (
                      <Row
                        key={name}
                        name={name}
                        amount={expensesByCategory[name] ?? 0}
                      />
                    ))}

                    <tr className="bg-slate-100 font-semibold text-slate-900">
                      <td className="px-4 py-2">Total Expense</td>
                      <td className="px-4 py-2 text-right">
                        {totalExpense.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr
                      className={`font-semibold ${
                        savings < 0
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <td className="px-4 py-2">Savings (this month)</td>
                      <td className="px-4 py-2 text-right">
                        {savings.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              title="Income (month)"
              amount={income}
              subtitle="All money coming in"
              badge="IN"
            />
            <StatCard
              title="Total expense (month)"
              amount={totalExpense}
              subtitle="What you spent this month"
              badge="OUT"
            />
            <StatCard
              title="Savings (month)"
              amount={savings}
              subtitle={
                savings < 0 ? "You overspent this month" : "Amount you kept"
              }
              badge={savings < 0 ? "ALERT" : "SAFE"}
              isAlert={savings < 0}
            />
            {/* ✅ NEW: all-months actual saving from Saving schema */}
            <StatCard
              title="Total savings (all months)"
              amount={totalActualSaving}
              subtitle="Sum of actual saving across all months"
              badge={totalActualSaving < 0 ? "ALERT" : "TOTAL"}
              isAlert={totalActualSaving < 0}
            />
          </div>
        </>
      )}
    </main>
  );
}

function Row({ name, amount, highlight = false }) {
  const formatted =
    typeof amount === "number"
      ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : amount;
  return (
    <tr
      className={
        highlight ? "bg-slate-50 text-emerald-700" : "border-t border-slate-200"
      }
    >
      <td className="px-4 py-2">{name}</td>
      <td className="px-4 py-2 text-right">{formatted}</td>
    </tr>
  );
}

function StatCard({ title, amount, subtitle, badge, isAlert = false }) {
  const display =
    typeof amount === "number"
      ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : amount;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide border ${
            isAlert
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        ₹{display}
      </p>
      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 md:text-sm">{subtitle}</p>
      )}
    </div>
  );
}

