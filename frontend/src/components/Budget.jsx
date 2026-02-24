// // frontend/src/pages/Budget.jsx
// import { useState, useEffect } from "react";
// import { Plus } from "lucide-react";
// import { jwtDecode } from "jwt-decode";

// const PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// export default function Budget() {
//   const [budgets, setBudgets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     _id: null,
//     title: "Monthly Budget",
//     year: new Date().getFullYear(),
//     month: new Date().getMonth() + 1,
//     budgetPercent: 0,
//     notes: "",
//   });
//   const [selected, setSelected] = useState(null); // selected budget doc
//   const [summary, setSummary] = useState(null); // computed summary
//   const [saving, setSaving] = useState(false);

//   // ✅ NEW: helper to decide if user can add/edit budget
//   const canCreateOrEditBudget =
//     summary && (summary.totalIncome ?? 0) > 0; // require some income for this month

//   // decode token to get userId and fetch data
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) return;
//     try {
//       const decoded = jwtDecode(token);
//       const userData = decoded.user || decoded;
//       if (userData && userData._id) {
//         fetchAllBudgets(userData._id);
//         fetchCurrent(userData._id);
//       }
//     } catch (err) {
//       console.error("Invalid token", err);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // optional: listen to summary update events (e.g. from Income page)
//   useEffect(() => {
//     function onBudgetUpdate(e) {
//       const s = e.detail;
//       if (!s) return;
//       mapAndSetSummary(s);
//     }
//     window.addEventListener("budgetSummaryUpdated", onBudgetUpdate);
//     return () =>
//       window.removeEventListener("budgetSummaryUpdated", onBudgetUpdate);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selected]);

//   async function fetchAllBudgets(userId) {
//     if (!userId) return;
//     try {
//       const res = await fetch(
//         `http://localhost:8000/budget?user_id=${userId}`
//       );
//       const data = await res.json();
//       if (res.ok && data.success) {
//         setBudgets(data.budgets || []);
//       } else {
//         console.warn("fetchAllBudgets:", data);
//         setBudgets([]);
//       }
//     } catch (err) {
//       console.error("fetchAllBudgets error:", err);
//       setBudgets([]);
//     }
//   }

//   async function fetchCurrent(userId) {
//     if (!userId) return;
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:8000/budget/current?user_id=${userId}`
//       );
//       const data = await res.json();
//       if (res.ok && data.success) {
//         setSelected(data.budget); // may be null
//         mapAndSetSummary(data.summary);
//       } else {
//         console.warn("fetchCurrent:", data);
//         setSelected(null);
//         setSummary(null);
//       }
//     } catch (err) {
//       console.error("fetchCurrent error:", err);
//       setSelected(null);
//       setSummary(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function mapAndSetSummary(s) {
//     if (!s) {
//       setSummary(null);
//       return;
//     }
//     const mapped = {
//       year: s.year,
//       month: s.month,
//       totalIncome: s.totalIncome ?? 0,
//       overallSpent: s.overallSpent ?? 0,
//       overallLimit: s.overallLimit ?? 0,
//       overallBudgetRemaining:
//         s.overallBudgetRemaining ??
//         ((s.overallLimit ?? 0) - (s.overallSpent ?? 0)),
//       cashRemaining:
//         s.cashRemaining ?? ((s.totalIncome ?? 0) - (s.overallSpent ?? 0)),
//       budgetPercent: s.budgetPercent ?? 0,
//       savingPercent: s.savingPercent ?? 0,
//       savingAmount: s.savingAmount ?? 0,
//     };

//     setSummary(mapped);
//   }

//   // Create or update budget
//   async function submitForm(e) {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) return alert("Not authenticated");
//       const decoded = jwtDecode(token);
//       const userData = decoded.user || decoded;
//       if (!userData || !userData._id) return alert("Not authenticated");

//       let pct = Number(form.budgetPercent) || 0;
//       if (pct < 0) pct = 0;
//       if (pct > 100) pct = 100;

//       const payload = {
//         user_id: userData._id,
//         title: form.title,
//         year: form.year,
//         month: form.month,
//         budgetPercent: pct,
//         notes: form.notes,
//       };

//       const res = await fetch("http://localhost:8000/budget", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to save budget");
//       }

//       await fetchAllBudgets(userData._id);
//       await fetchCurrent(userData._id);
//       setShowForm(false);
//     } catch (err) {
//       console.error("submitForm error:", err);
//       alert(err.message || "Failed to save budget");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // delete budget
//   async function deleteBudget(id) {
//     if (!window.confirm("Delete this budget?")) return;
//     try {
//       const res = await fetch(`http://localhost:8000/budget/${id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success)
//         throw new Error(data.message || "Delete failed");

//       const token = localStorage.getItem("authToken");
//       if (token) {
//         const decoded = jwtDecode(token);
//         const userData = decoded.user || decoded;
//         if (userData && userData._id) {
//           await fetchAllBudgets(userData._id);
//           await fetchCurrent(userData._id);
//         }
//       }
//     } catch (err) {
//       console.error("deleteBudget error:", err);
//       alert(err.message || "Delete failed");
//     }
//   }

//   // Fetch specific budget by id
//   async function fetchBudgetByIdAndSummary(budgetId) {
//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:8000/budget/${budgetId}`);
//       const data = await res.json();
//       if (res.ok && data.success) {
//         setSelected(data.budget);
//         if (data.summary) {
//           mapAndSetSummary(data.summary);
//         }
//       } else {
//         console.warn("fetchBudgetByIdAndSummary:", data);
//       }
//     } catch (err) {
//       console.error("fetchBudgetByIdAndSummary error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function percent(part, total) {
//     if (!total || total === 0) return 0;
//     return Math.round((part / total) * 100);
//   }

//   return (
//     <div className="p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
//         <div>
//           <h2 className="text-2xl font-bold">Budget (Overall)</h2>
//           {/* ✅ Info text when button is disabled */}
//           {(!summary || (summary.totalIncome ?? 0) <= 0) && (
//             <p className="mt-1 text-xs text-red-500">
//               Add at least one income entry for this month to enable budget
//               creation.
//             </p>
//           )}
//         </div>

//         {/* ✅ Button disabled when no income */}
//         <button
//           disabled={!canCreateOrEditBudget}
//           onClick={() => {
//             if (!canCreateOrEditBudget) return;
//             setShowForm(!showForm);
//             setForm({
//               _id: null,
//               title: "Monthly Budget",
//               year: new Date().getFullYear(),
//               month: new Date().getMonth() + 1,
//               budgetPercent: summary?.budgetPercent ?? 0,
//               notes: "",
//             });
//           }}
//           className={`px-4 py-2 rounded flex items-center gap-2 ${
//             canCreateOrEditBudget
//               ? "bg-indigo-600 text-white hover:bg-indigo-700"
//               : "bg-gray-300 text-gray-500 cursor-not-allowed"
//           }`}
//         >
//           <Plus className="w-4 h-4" /> New / Edit Budget
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left: budget list */}
//         <div className="col-span-1">
//           <div className="space-y-3">
//             {loading && (
//               <div className="text-sm text-gray-500">Loading...</div>
//             )}
//             {!loading && budgets.length === 0 && (
//               <div className="text-sm text-gray-500">No budgets yet.</div>
//             )}
//             {budgets.map((b) => (
//               <div
//                 key={b._id}
//                 className={`p-3 rounded border cursor-pointer ${
//                   selected && selected._id === b._id
//                     ? "bg-gray-50"
//                     : "bg-white"
//                 }`}
//                 onClick={() => fetchBudgetByIdAndSummary(b._id)}
//               >
//                 <div className="flex justify-between">
//                   <div>
//                     <div className="font-medium">{b.title}</div>
//                     <div className="text-xs text-gray-500">
//                       {b.month}/{b.year}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-xs text-gray-500">Budget</div>
//                     <div className="font-semibold">₹{b.overallLimit ?? 0}</div>
//                     <div className="text-xs text-gray-500">
//                       {b.budgetPercent ?? 0}% of income
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mt-2 flex gap-2">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       // Only allow edit if income exists
//                       if (!canCreateOrEditBudget) return;
//                       setShowForm(true);
//                       setForm({
//                         _id: b._id,
//                         title: b.title,
//                         year: b.year,
//                         month: b.month,
//                         budgetPercent: b.budgetPercent ?? 0,
//                         notes: b.notes || "",
//                       });
//                     }}
//                     className={`px-2 py-1 rounded text-sm ${
//                       canCreateOrEditBudget
//                         ? "bg-yellow-400"
//                         : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                     }`}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteBudget(b._id);
//                     }}
//                     className="px-2 py-1 rounded bg-red-500 text-white text-sm"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right: details / form */}
//         <div className="col-span-2">
//           {showForm ? (
//             <form
//               onSubmit={submitForm}
//               className="bg-white p-6 rounded shadow space-y-4"
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium">Title</label>
//                   <input
//                     value={form.title}
//                     onChange={(e) =>
//                       setForm((prev) => ({ ...prev, title: e.target.value }))
//                     }
//                     className="mt-1 block w-full p-2 border rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">
//                     Budget % of Income
//                   </label>
//                   <select
//                     value={form.budgetPercent}
//                     onChange={(e) =>
//                       setForm((prev) => ({
//                         ...prev,
//                         budgetPercent: Number(e.target.value),
//                       }))
//                     }
//                     className="mt-1 block w-full p-2 border rounded"
//                   >
//                     <option value={0}>Select %</option>
//                     {PERCENT_OPTIONS.map((opt) => (
//                       <option key={opt} value={opt}>
//                         {opt}%
//                       </option>
//                     ))}
//                   </select>
//                   <p className="mt-1 text-xs text-gray-500">
//                     Total income this month: ₹{summary?.totalIncome ?? 0}.
//                     <br />
//                     {form.budgetPercent > 0 && summary?.totalIncome ? (
//                       <>
//                         You are budgeting {form.budgetPercent}% = ₹
//                         {Math.round(
//                           (summary.totalIncome * form.budgetPercent) / 100
//                         )}
//                         , saving the rest.
//                       </>
//                     ) : (
//                       "Choose a percentage for your monthly budget."
//                     )}
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">Year</label>
//                   <input
//                     type="number"
//                     value={form.year}
//                     onChange={(e) =>
//                       setForm((prev) => ({
//                         ...prev,
//                         year: Number(e.target.value),
//                       }))
//                     }
//                     className="mt-1 block w-full p-2 border rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium">Month</label>
//                   <select
//                     value={form.month}
//                     onChange={(e) =>
//                       setForm((prev) => ({
//                         ...prev,
//                         month: Number(e.target.value),
//                       }))
//                     }
//                     className="mt-1 block w-full p-2 border rounded"
//                   >
//                     {Array.from({ length: 12 }).map((_, i) => (
//                       <option key={i + 1} value={i + 1}>
//                         {i + 1}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium">Notes</label>
//                 <textarea
//                   value={form.notes}
//                   onChange={(e) =>
//                     setForm((prev) => ({ ...prev, notes: e.target.value }))
//                   }
//                   className="mt-1 block w-full p-2 border rounded"
//                   rows="3"
//                 />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="px-4 py-2 bg-blue-600 text-white rounded"
//                 >
//                   {saving ? "Saving..." : "Save Budget"}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="bg-white p-6 rounded shadow">
//               {summary ? (
//                 <>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h3 className="text-xl font-semibold">
//                         {selected?.title || "Current Month Budget"}
//                       </h3>
//                       <div className="text-sm text-gray-500">
//                         {summary.month}/{summary.year}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-gray-500">Budget</div>
//                       <div className="text-lg font-semibold">
//                         ₹{summary.overallLimit}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {summary.budgetPercent}% of income
//                       </div>
//                     </div>
//                   </div>

//                   {/* Overall stats */}
//                   <div className="mt-4 space-y-2 text-sm">
//                     <div>
//                       Total Income:{" "}
//                       <span className="font-semibold">
//                         ₹{summary.totalIncome}
//                       </span>
//                     </div>
//                     <div>
//                       Total Spent:{" "}
//                       <span className="font-semibold">
//                         ₹{summary.overallSpent}
//                       </span>
//                     </div>

//                     <div className="mt-2">
//                       <div className="text-xs text-gray-500 mb-1">
//                         Budget usage
//                       </div>
//                       <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
//                         <div
//                           className="h-4 rounded-full"
//                           style={{
//                             width: `${percent(
//                               summary.overallSpent,
//                               summary.overallLimit || 1
//                             )}%`,
//                             background:
//                               summary.overallSpent > summary.overallLimit
//                                 ? "#ef4444"
//                                 : "#10b981",
//                           }}
//                         />
//                       </div>
//                       <div className="mt-1 text-xs text-gray-600">
//                         {percent(
//                           summary.overallSpent,
//                           summary.overallLimit || 1
//                         )}
//                         % of budget used
//                       </div>
//                     </div>

//                     <div className="mt-3 flex flex-wrap gap-4">
//                       <div>
//                         <div className="text-xs text-gray-500">
//                           Budget remaining
//                         </div>
//                         <div
//                           className={`text-lg font-semibold ${
//                             summary.overallBudgetRemaining < 0
//                               ? "text-red-600"
//                               : "text-green-600"
//                           }`}
//                         >
//                           ₹{summary.overallBudgetRemaining}
//                         </div>
//                       </div>

//                       <div>
//                         <div className="text-xs text-gray-500">
//                           Cash remaining (income - expenses)
//                         </div>
//                         <div
//                           className={`text-lg font-semibold ${
//                             summary.cashRemaining < 0
//                               ? "text-red-600"
//                               : "text-green-600"
//                           }`}
//                         >
//                           ₹{summary.cashRemaining}
//                         </div>
//                       </div>

//                       <div>
//                         <div className="text-xs text-gray-500">
//                           Planned saving
//                         </div>
//                         <div className="text-lg font-semibold text-blue-600">
//                           ₹{summary.savingAmount}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {summary.savingPercent}% of income
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {selected?.notes && (
//                     <div className="mt-4 text-sm text-gray-600">
//                       Notes: {selected.notes}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div>
//                   <div className="text-sm text-gray-500">
//                     No budget set for current month.
//                   </div>
//                   <div className="mt-3 text-sm text-gray-600">
//                     Click <strong>New / Edit Budget</strong> to configure an
//                     overall budget as a percentage of your income.
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// frontend/src/pages/Budget.jsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    title: "Monthly Budget",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    budgetPercent: 0,
    notes: "",
  });
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ require some income for this month
  const canCreateOrEditBudget = summary && (summary.totalIncome ?? 0) > 0;

  // decode token and fetch data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userData = decoded.user || decoded;
      if (userData && userData._id) {
        fetchAllBudgets(userData._id);
        fetchCurrent(userData._id);
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen to summary updates from other pages
  useEffect(() => {
    function onBudgetUpdate(e) {
      const s = e.detail;
      if (!s) return;
      mapAndSetSummary(s);
    }
    window.addEventListener("budgetSummaryUpdated", onBudgetUpdate);
    return () =>
      window.removeEventListener("budgetSummaryUpdated", onBudgetUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function fetchAllBudgets(userId) {
    if (!userId) return;
    try {
      const res = await fetch(
        `http://localhost:8000/budget?user_id=${userId}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setBudgets(data.budgets || []);
      } else {
        console.warn("fetchAllBudgets:", data);
        setBudgets([]);
      }
    } catch (err) {
      console.error("fetchAllBudgets error:", err);
      setBudgets([]);
    }
  }

  async function fetchCurrent(userId) {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/budget/current?user_id=${userId}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSelected(data.budget);
        mapAndSetSummary(data.summary);
      } else {
        console.warn("fetchCurrent:", data);
        setSelected(null);
        setSummary(null);
      }
    } catch (err) {
      console.error("fetchCurrent error:", err);
      setSelected(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function mapAndSetSummary(s) {
    if (!s) {
      setSummary(null);
      return;
    }
    const mapped = {
      year: s.year,
      month: s.month,
      totalIncome: s.totalIncome ?? 0,
      overallSpent: s.overallSpent ?? 0,
      overallLimit: s.overallLimit ?? 0,
      overallBudgetRemaining:
        s.overallBudgetRemaining ??
        ((s.overallLimit ?? 0) - (s.overallSpent ?? 0)),
      cashRemaining:
        s.cashRemaining ?? ((s.totalIncome ?? 0) - (s.overallSpent ?? 0)),
      budgetPercent: s.budgetPercent ?? 0,
      savingPercent: s.savingPercent ?? 0,
      savingAmount: s.savingAmount ?? 0,
    };

    setSummary(mapped);
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return alert("Not authenticated");
      const decoded = jwtDecode(token);
      const userData = decoded.user || decoded;
      if (!userData || !userData._id) return alert("Not authenticated");

      let pct = Number(form.budgetPercent) || 0;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      const payload = {
        user_id: userData._id,
        title: form.title,
        year: form.year,
        month: form.month,
        budgetPercent: pct,
        notes: form.notes,
      };

      const res = await fetch("http://localhost:8000/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save budget");
      }

      await fetchAllBudgets(userData._id);
      await fetchCurrent(userData._id);
      setShowForm(false);
    } catch (err) {
      console.error("submitForm error:", err);
      alert(err.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudget(id) {
    if (!window.confirm("Delete this budget?")) return;
    try {
      const res = await fetch(`http://localhost:8000/budget/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Delete failed");

      const token = localStorage.getItem("authToken");
      if (token) {
        const decoded = jwtDecode(token);
        const userData = decoded.user || decoded;
        if (userData && userData._id) {
          await fetchAllBudgets(userData._id);
          await fetchCurrent(userData._id);
        }
      }
    } catch (err) {
      console.error("deleteBudget error:", err);
      alert(err.message || "Delete failed");
    }
  }

  async function fetchBudgetByIdAndSummary(budgetId) {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/budget/${budgetId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelected(data.budget);
        if (data.summary) {
          mapAndSetSummary(data.summary);
        }
      } else {
        console.warn("fetchBudgetByIdAndSummary:", data);
      }
    } catch (err) {
      console.error("fetchBudgetByIdAndSummary error:", err);
    } finally {
      setLoading(false);
    }
  }

  function percent(part, total) {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
              Budget Overview
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Budget (Overall)
            </h2>
            {(!summary || (summary.totalIncome ?? 0) <= 0) && (
              <p className="mt-1 text-xs text-rose-600">
                Add at least one income entry for this month to enable budget
                creation.
              </p>
            )}
          </div>

          {/* New / Edit button */}
          <button
            disabled={!canCreateOrEditBudget}
            onClick={() => {
              if (!canCreateOrEditBudget) return;
              setShowForm(!showForm);
              setForm({
                _id: null,
                title: "Monthly Budget",
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                budgetPercent: summary?.budgetPercent ?? 0,
                notes: "",
              });
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all ${
              canCreateOrEditBudget
                ? "bg-gradient-to-r from-teal-500 via-emerald-400 to-lime-400 text-white hover:shadow-lg hover:scale-[1.02]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Plus className="w-4 h-4" />
            New / Edit Budget
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: budget list */}
          <div className="col-span-1">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-md">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Saved Budgets
              </h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {loading && (
                  <div className="text-xs text-slate-500">Loading...</div>
                )}
                {!loading && budgets.length === 0 && (
                  <div className="text-xs text-slate-500">
                    No budgets yet. Create one using the button above.
                  </div>
                )}
                {budgets.map((b) => (
                  <div
                    key={b._id}
                    className={`rounded-xl border px-3 py-3 cursor-pointer transition-all ${
                      selected && selected._id === b._id
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                    onClick={() => fetchBudgetByIdAndSummary(b._id)}
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm text-slate-800">
                          {b.title}
                        </div>
                        <div className="text-[0.7rem] text-slate-500 mt-0.5">
                          {b.month}/{b.year}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[0.7rem] text-slate-500">
                          Budget
                        </div>
                        <div className="text-sm font-semibold text-emerald-600">
                          ₹{b.overallLimit ?? 0}
                        </div>
                        <div className="text-[0.7rem] text-slate-500">
                          {b.budgetPercent ?? 0}% of income
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!canCreateOrEditBudget) return;
                          setShowForm(true);
                          setForm({
                            _id: b._id,
                            title: b.title,
                            year: b.year,
                            month: b.month,
                            budgetPercent: b.budgetPercent ?? 0,
                            notes: b.notes || "",
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          canCreateOrEditBudget
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBudget(b._id);
                        }}
                        className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: details / form */}
          <div className="col-span-2">
            {showForm ? (
              <form
                onSubmit={submitForm}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md space-y-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {form._id ? "Edit Budget" : "Create New Budget"}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Plan your spending as a percentage of income
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Title
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Budget % of Income
                    </label>
                    <select
                      value={form.budgetPercent}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          budgetPercent: Number(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none bg-white"
                    >
                      <option value={0}>Select %</option>
                      {PERCENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}%
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      Total income this month: ₹{summary?.totalIncome ?? 0}.
                      <br />
                      {form.budgetPercent > 0 && summary?.totalIncome ? (
                        <>
                          You are budgeting {form.budgetPercent}% = ₹
                          {Math.round(
                            (summary.totalIncome * form.budgetPercent) / 100
                          )}
                          , saving the rest.
                        </>
                      ) : (
                        "Choose a percentage for your monthly budget."
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Year
                    </label>
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          year: Number(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Month
                    </label>
                    <select
                      value={form.month}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          month: Number(e.target.value),
                        }))
                      }
                      className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none bg-white"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="mt-1 block w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none bg-white resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-400 to-lime-400 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {saving ? "Saving..." : "Save Budget"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md">
                {summary ? (
                  <>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {selected?.title || "Current Month Budget"}
                        </h3>
                        <div className="text-sm text-slate-500 mt-1">
                          {summary.month}/{summary.year}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Budget</div>
                        <div className="text-lg font-semibold text-emerald-600">
                          ₹{summary.overallLimit}
                        </div>
                        <div className="text-xs text-slate-500">
                          {summary.budgetPercent}% of income
                        </div>
                      </div>
                    </div>

                    {/* Overall stats */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-xs text-slate-500">
                          Total income
                        </div>
                        <div className="mt-1 text-base font-semibold text-slate-800">
                          ₹{summary.totalIncome}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-xs text-slate-500">
                          Total spent
                        </div>
                        <div className="mt-1 text-base font-semibold text-rose-600">
                          ₹{summary.overallSpent}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-xs text-slate-500">
                          Planned saving
                        </div>
                        <div className="mt-1 text-base font-semibold text-sky-600">
                          ₹{summary.savingAmount}
                        </div>
                        <div className="text-[0.7rem] text-slate-500">
                          {summary.savingPercent}% of income
                        </div>
                      </div>
                    </div>

                    {/* Budget usage bar */}
                    <div className="mt-5">
                      <div className="text-xs text-slate-500 mb-1">
                        Budget usage
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${percent(
                              summary.overallSpent,
                              summary.overallLimit || 1
                            )}%`,
                            background:
                              summary.overallSpent > summary.overallLimit
                                ? "#ef4444"
                                : "#10b981",
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {percent(
                          summary.overallSpent,
                          summary.overallLimit || 1
                        )}
                        % of budget used
                      </div>
                    </div>

                    {/* Remaining / cash / notes */}
                    <div className="mt-4 flex flex-wrap gap-5 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">
                          Budget remaining
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            summary.overallBudgetRemaining < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          ₹{summary.overallBudgetRemaining}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">
                          Cash remaining (income - expenses)
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            summary.cashRemaining < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          ₹{summary.cashRemaining}
                        </div>
                      </div>
                    </div>

                    {selected?.notes && (
                      <div className="mt-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
                        <span className="font-medium">Notes:</span>{" "}
                        {selected.notes}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="text-sm text-slate-600">
                      No budget set for current month.
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      Click{" "}
                      <span className="font-semibold">New / Edit Budget</span>{" "}
                      to configure an overall budget as a percentage of your
                      income.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    // </div>
  );
}
