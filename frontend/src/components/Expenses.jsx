// import { useState, useEffect } from "react";
// import { Plus, TrendingUp, Calendar, DollarSign, Briefcase } from "lucide-react";
// import { jwtDecode } from "jwt-decode";

// export default function Expenses() {
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     amount: "",
//     category: "",
//     description: "",
//     date: new Date().toISOString().split("T")[0],
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [userId, setUserId] = useState("");

//   // 👇 NEW: store current month budget summary on Expense page
//   const [budgetSummary, setBudgetSummary] = useState(null);

//   // Get user id from token
//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const userData = decoded.user || decoded;
//         if (userData && userData._id) setUserId(userData._id);
//       } catch (err) {
//         console.error("Invalid token", err);
//       }
//     }
//   }, []);

//   // Fetch expenses for user
//   useEffect(() => {
//     const fetchExpenses = async () => {
//       if (!userId) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `http://localhost:8000/expense?user_id=${userId}`
//         );
//         if (!res.ok) throw new Error("Failed to fetch expenses");
//         const data = await res.json();

//         if (Array.isArray(data)) {
//           setExpenses(data);
//         } else if (Array.isArray(data.expenses)) {
//           setExpenses(data.expenses);
//         } else if (Array.isArray(data.expense)) {
//           setExpenses(data.expense);
//         } else {
//           setExpenses(data || []);
//         }
//       } catch (err) {
//         console.error("fetch expenses error:", err);
//         setExpenses([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpenses();
//   }, [userId]);

//   // 👇 NEW: fetch current month budget summary when we know userId
//   useEffect(() => {
//     const fetchCurrentBudget = async () => {
//       if (!userId) return;
//       try {
//         const res = await fetch(
//           `http://localhost:8000/budget/current?user_id=${userId}`
//         );
//         const data = await res.json();
//         if (res.ok && data.success && data.summary) {
//           setBudgetSummary(data.summary);
//         } else {
//           setBudgetSummary(null);
//         }
//       } catch (err) {
//         console.error("fetchCurrentBudget error:", err);
//         setBudgetSummary(null);
//       }
//     };

//     fetchCurrentBudget();
//   }, [userId]);

//   // Add new expense (overall budget check + update remaining)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       if (!userId) {
//         alert("User not authenticated");
//         return;
//       }

//       const res = await fetch("http://localhost:8000/expense", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: userId,
//           amount: parseFloat(formData.amount),
//           category: formData.category,
//           description: formData.description,
//           date: formData.date,
//         }),
//       });

//       const result = await res.json();

//       if (!res.ok) {
//         const msg = result?.message || "Failed to add expense";
//         throw new Error(msg);
//       }

//       // Insert created expense into UI if returned
//       let createdExpense = null;
//       if (result.expense) {
//         createdExpense = result.expense;
//       } else if (result && result._id) {
//         createdExpense = result;
//       }

//       if (createdExpense) {
//         setExpenses((prev) => [createdExpense, ...prev]);
//       }

//       // Use summary from backend (we set it to afterSummary in controller)
//       const summary =
//         result.summary || result.summaryAfter || budgetSummary || null;

//       if (summary) {
//         // Update local summary state so top card refreshes
//         setBudgetSummary(summary);

//         // Optional: also store for Budget page sync
//         try {
//           localStorage.setItem(
//             "latestBudgetSummary",
//             JSON.stringify(summary)
//           );
//           window.dispatchEvent(
//             new CustomEvent("budgetSummaryUpdated", { detail: summary })
//           );
//         } catch (e) {
//           // ignore
//         }

//         const hasOverall =
//           typeof summary.overallLimit === "number" &&
//           typeof summary.overallSpent === "number" &&
//           summary.overallLimit > 0;

//         if (hasOverall) {
//           const percentUsed = Math.round(
//             (summary.overallSpent / summary.overallLimit) * 100
//           );
//           const remaining =
//             typeof summary.overallBudgetRemaining === "number"
//               ? summary.overallBudgetRemaining
//               : summary.overallLimit - summary.overallSpent;

//           // 🚨 Over budget (total spent > overallLimit)
//           if (summary.overallSpent > summary.overallLimit) {
//             const overBy = summary.overallSpent - summary.overallLimit;
//             alert(
//               `🚨 Overall budget exceeded!\n` +
//                 `Spent: ₹${summary.overallSpent} of ₹${summary.overallLimit}\n` +
//                 `You are over by ₹${overBy} (${percentUsed}% used).`
//             );
//           } else {
//             // Normal / warning state with remaining
//             let baseMsg =
//               `Expense added.\n` +
//               `Total spent: ₹${summary.overallSpent} of ₹${summary.overallLimit}.\n` +
//               `Remaining budget: ₹${remaining}.`;

//             if (percentUsed >= 80) {
//               baseMsg += `\n⚠️ Warning: You have used ${percentUsed}% of your budget.`;
//             }

//             alert(baseMsg);
//           }
//         } else if (typeof summary.cashRemaining !== "undefined") {
//           alert(
//             `Expense added. Cash remaining this month: ₹${summary.cashRemaining}.`
//           );
//         } else {
//           alert("Expense added.");
//         }
//       } else {
//         alert("Expense added.");
//       }

//       // Reset form & close
//       setFormData({
//         amount: "",
//         category: "",
//         description: "",
//         date: new Date().toISOString().split("T")[0],
//       });
//       setShowForm(false);
//     } catch (error) {
//       console.error("Error adding expense:", error);
//       alert(error.message || "Failed to add expense. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const formatDate = (dateString) =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   // Helper for card percentage
//   const percent = (part, total) => {
//     if (!total || total === 0) return 0;
//     return Math.round((part / total) * 100);
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex items-center gap-3 mb-2">
//           <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
//             <TrendingUp className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold text-gray-800">Expense Tracker</h1>
//         </div>
//         <p className="text-gray-600 ml-14">
//           Track and manage your expenses against your monthly budget
//         </p>
//       </div>

//       {/* 👇 NEW: Budget summary card on Expense page */}
//       {budgetSummary && (
//         <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="bg-white rounded-2xl shadow p-4 border border-emerald-100">
//             <div className="text-xs text-gray-500">Monthly Budget</div>
//             <div className="text-lg font-semibold">
//               ₹{budgetSummary.overallLimit || 0}
//             </div>
//             <div className="text-xs text-gray-500">
//               {budgetSummary.budgetPercent ?? 0}% of income
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow p-4 border border-emerald-100">
//             <div className="text-xs text-gray-500">Total Spent</div>
//             <div className="text-lg font-semibold text-emerald-600">
//               ₹{budgetSummary.overallSpent || 0}
//             </div>
//             <div className="mt-1 text-xs text-gray-500">
//               {percent(
//                 budgetSummary.overallSpent || 0,
//                 budgetSummary.overallLimit || 1
//               )}
//               % of budget used
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow p-4 border border-emerald-100">
//             <div className="text-xs text-gray-500">Budget Remaining</div>
//             <div
//               className={`text-lg font-semibold ${
//                 (budgetSummary.overallBudgetRemaining ?? 0) < 0
//                   ? "text-red-600"
//                   : "text-green-600"
//               }`}
//             >
//               ₹
//               {typeof budgetSummary.overallBudgetRemaining === "number"
//                 ? budgetSummary.overallBudgetRemaining
//                 : (budgetSummary.overallLimit || 0) -
//                   (budgetSummary.overallSpent || 0)}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add expense Button */}
//       <div className="mb-8">
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//         >
//           <Plus className="w-5 h-5" />
//           Add New Expense
//         </button>
//       </div>

//       {/* Add Expense Form */}
//       {showForm && (
//         <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Expense</h2>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Amount *
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <DollarSign className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="number"
//                     step="0.01"
//                     required
//                     value={formData.amount}
//                     onChange={(e) =>
//                       setFormData({ ...formData, amount: e.target.value })
//                     }
//                     className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
//                     placeholder="0.00"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Date *
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                     <Calendar className="w-5 h-5 text-gray-400" />
//                   </div>
//                   <input
//                     type="date"
//                     required
//                     value={formData.date}
//                     onChange={(e) =>
//                       setFormData({ ...formData, date: e.target.value })
//                     }
//                     className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Category *
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <Briefcase className="w-5 h-5 text-gray-400" />
//                 </div>
//                 <select
//                   required
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white text-gray-700"
//                 >
//                   <option value="">Select Expense category</option>
//                   <option value="Food">Food</option>
//                   <option value="Travel">Travel</option>
//                   <option value="Shopping">Shopping</option>
//                   <option value="Bills">Bills</option>
//                   <option value="Rent">Rent</option>
//                   <option value="Medical">Medical</option>
//                   <option value="Others">Others</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 rows={3}
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
//                 placeholder="Additional details (optional)"
//               />
//             </div>

//             <div className="flex gap-3 pt-2">
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {submitting ? "Adding..." : "Add Expense"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Recent Expense */}
//       <div>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           Recent Expense
//         </h2>

//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
//           </div>
//         ) : expenses.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//               <TrendingUp className="w-8 h-8 text-gray-400" />
//             </div>
//             <p className="text-gray-500 text-lg">No expense entries yet</p>
//             <p className="text-gray-400 text-sm mt-2">
//               Add your first expense to get started
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {expenses.map((ex) => (
//               <div
//                 key={ex._id}
//                 className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
//                         <Briefcase className="w-5 h-5 text-emerald-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-800">
//                           {ex.category}
//                         </h3>
//                         <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
//                           <Calendar className="w-4 h-4" />
//                           {formatDate(ex.date)}
//                         </div>
//                       </div>
//                     </div>
//                     {ex.description && (
//                       <p className="text-gray-600 mt-3 ml-11 leading-relaxed">
//                         {ex.description}
//                       </p>
//                     )}
//                   </div>
//                   <div className="text-right ml-4">
//                     <div className="text-3xl font-bold text-emerald-600">
//                       {ex.amount}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Calendar,
  IndianRupee,
  Briefcase,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [budgetSummary, setBudgetSummary] = useState(null);

  // ✅ Rupee formatting helper
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  // Get user id from token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = decoded.user || decoded;
        if (userData && userData._id) setUserId(userData._id);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  // Fetch expenses for user
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/expense?user_id=${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();

        if (Array.isArray(data)) {
          setExpenses(data);
        } else if (Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
        } else if (Array.isArray(data.expense)) {
          setExpenses(data.expense);
        } else {
          setExpenses(data || []);
        }
      } catch (err) {
        console.error("fetch expenses error:", err);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [userId]);

  // Fetch current month budget summary
  useEffect(() => {
    const fetchCurrentBudget = async () => {
      if (!userId) return;
      try {
        const res = await fetch(
          `http://localhost:8000/budget/current?user_id=${userId}`
        );
        const data = await res.json();
        if (res.ok && data.success && data.summary) {
          setBudgetSummary(data.summary);
        } else {
          setBudgetSummary(null);
        }
      } catch (err) {
        console.error("fetchCurrentBudget error:", err);
        setBudgetSummary(null);
      }
    };

    fetchCurrentBudget();
  }, [userId]);

  // Add new expense (overall budget check + update remaining)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!userId) {
        alert("User not authenticated");
        return;
      }

      const res = await fetch("http://localhost:8000/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        const msg = result?.message || "Failed to add expense";
        throw new Error(msg);
      }

      let createdExpense = null;
      if (result.expense) {
        createdExpense = result.expense;
      } else if (result && result._id) {
        createdExpense = result;
      }

      if (createdExpense) {
        setExpenses((prev) => [createdExpense, ...prev]);
      }

      const summary =
        result.summary || result.summaryAfter || budgetSummary || null;

      if (summary) {
        setBudgetSummary(summary);

        try {
          localStorage.setItem("latestBudgetSummary", JSON.stringify(summary));
          window.dispatchEvent(
            new CustomEvent("budgetSummaryUpdated", { detail: summary })
          );
        } catch (e) {}

        const hasOverall =
          typeof summary.overallLimit === "number" &&
          typeof summary.overallSpent === "number" &&
          summary.overallLimit > 0;

        if (hasOverall) {
          const percentUsed = Math.round(
            (summary.overallSpent / summary.overallLimit) * 100
          );
          const remaining =
            typeof summary.overallBudgetRemaining === "number"
              ? summary.overallBudgetRemaining
              : summary.overallLimit - summary.overallSpent;

          if (summary.overallSpent > summary.overallLimit) {
            const overBy = summary.overallSpent - summary.overallLimit;
            alert(
              `🚨 Overall budget exceeded!\n` +
                `Spent: ₹${summary.overallSpent} of ₹${summary.overallLimit}\n` +
                `You are over by ₹${overBy} (${percentUsed}% used).`
            );
          } else {
            let baseMsg =
              `Expense added.\n` +
              `Total spent: ₹${summary.overallSpent} of ₹${summary.overallLimit}.\n` +
              `Remaining budget: ₹${remaining}.`;

            if (percentUsed >= 80) {
              baseMsg += `\n⚠️ Warning: You have used ${percentUsed}% of your budget.`;
            }

            alert(baseMsg);
          }
        } else if (typeof summary.cashRemaining !== "undefined") {
          alert(
            `Expense added. Cash remaining this month: ₹${summary.cashRemaining}.`
          );
        } else {
          alert("Expense added.");
        }
      } else {
        alert("Expense added.");
      }

      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert(error.message || "Failed to add expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const percent = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };
  // ✅ Current month & year
  const now = new Date();
  const currentMonth = now.getMonth(); // 0–11
  const currentYear = now.getFullYear();

  // ✅ Total expense of current month
  const currentMonthExpense = expenses
    .filter((ex) => {
      const d = new Date(ex.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, ex) => sum + Number(ex.amount || 0), 0);

  const spentPct = budgetSummary
    ? percent(budgetSummary.overallSpent || 0, budgetSummary.overallLimit || 1)
    : 0;

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900">
    <div
      className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Expense Overview</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 shadow-md">
              <IndianRupee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Expense Tracker
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Track and manage your expenses against your monthly budget.
              </p>
              <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-orange-400" />
            </div>
          </div>
        </div>

        {/* Small summary pill */}
        {budgetSummary && (
          <div className="rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-md min-w-[220px]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total spent this month
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Spent{" "}
              <span className="font-semibold text-rose-600">
                {formatCurrency(currentMonthExpense)}
              </span>
            </p>
            {/* <p className="text-xs text-slate-500 mt-1">
              {spentPct}% of your budget used
            </p> */}
          </div>
        )}
      </div>

      {/* Budget summary cards */}
      {budgetSummary && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Monthly Budget
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-800">
              {formatCurrency(budgetSummary.overallLimit || 0)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {budgetSummary.budgetPercent ?? 0}% of income
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Total Spent
            </div>
            <div className="mt-2 text-lg font-semibold text-rose-600">
              {formatCurrency(budgetSummary.overallSpent || 0)}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Budget used</span>
                <span>{spentPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    spentPct >= 100
                      ? "bg-rose-500"
                      : spentPct >= 80
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(spentPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Budget Remaining
            </div>
            <div
              className={`mt-2 text-lg font-semibold ${
                (budgetSummary.overallBudgetRemaining ?? 0) < 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {formatCurrency(
                typeof budgetSummary.overallBudgetRemaining === "number"
                  ? budgetSummary.overallBudgetRemaining
                  : (budgetSummary.overallLimit || 0) -
                      (budgetSummary.overallSpent || 0)
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Keep tracking your daily expenses.
            </p>
          </div>
        </div>
      )}

      {/* Add expense Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Close Form" : "Add New Expense"}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm">
              +
            </span>
            Add Expense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all outline-none"
                    placeholder="₹ 0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all outline-none bg-white text-slate-800"
                >
                  <option value="">Select expense category</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Bills">Bills</option>
                  <option value="Rent">Rent</option>
                  <option value="Medical">Medical</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all outline-none resize-none text-slate-800"
                placeholder="Additional details (optional)"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? "Adding..." : "Add Expense"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Expense */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800">
            Recent Expenses
          </h2>
          {expenses.length > 0 && (
            <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600">
              {"3"} entr{expenses.length === 1 ? "y" : "ies"}
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg">No expense entries yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Add your first expense to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {expenses.slice(0, 3).map((ex) => (
              <div
                key={ex._id}
                className="bg-white rounded-2xl shadow-md border border-slate-200 hover:border-rose-300 hover:shadow-lg transition-all duration-200 p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2.5 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl">
                        <Briefcase className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {ex.category}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(ex.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {ex.description && (
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {ex.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl sm:text-3xl font-bold text-rose-500 tracking-tight">
                      {formatCurrency(ex.amount)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">
                      Amount
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    // </div>
  );
}
