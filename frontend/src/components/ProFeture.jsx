// // import React, { useEffect, useState } from "react";
// // import PurchaseModal from "./PurchaseModal";

// // const API_BASE = "http://localhost:8000";

// // export default function ProFeture() {
// //   const [user, setUser] = useState(null);
// //   const [showPurchase, setShowPurchase] = useState(false);

// //   // 🔽 New state for bill upload feature
// //   const [billFile, setBillFile] = useState(null);
// //   const [uploadLoading, setUploadLoading] = useState(false);
// //   const [uploadError, setUploadError] = useState("");
// //   const [billResult, setBillResult] = useState(null);

// //   useEffect(() => {
// //     const raw = localStorage.getItem("authUser");
// //     if (raw) {
// //       try {
// //         setUser(JSON.parse(raw));
// //       } catch (err) {
// //         console.error("Invalid authUser in localStorage:", err);
// //       }
// //     }
// //   }, []);

// //   const isPro = user?.isPro === true;

// //   function handleProClick() {
// //     if (isPro) {
// //       return;
// //     }
// //     setShowPurchase(true);
// //   }

// // async function handleBillSubmit(e) {
// //   e.preventDefault();
// //   setUploadError("");
// //   setBillResult(null);

// //   const userId = user?._id || user?.id; 

// //   if (!billFile) {
// //     setUploadError("Please select a bill file first.");
// //     return;
// //   }

// //   if (!userId) {
// //     setUploadError("User information not found. Please log in again.");
// //     return;
// //   }

// //   try {
// //     setUploadLoading(true);

// //     const formData = new FormData();
// //     formData.append("bill", billFile);
// //     formData.append("user_id", userId); 

// //     const res = await fetch(`${API_BASE}/expense/upload-bill`, {
// //       method: "POST",
// //       body: formData,
// //     });

// //     const data = await res.json();
// //     if (!res.ok) {
// //       throw new Error(data.message || "Failed to process bill");
// //     }

// //     setBillResult({
// //       category: data.category,
// //       amount: data.amount,
// //     });
// //   } catch (err) {
// //     console.error("Bill upload error:", err);
// //     setUploadError(err.message || "Something went wrong");
// //   } finally {
// //     setUploadLoading(false);
// //   }
// // }


// //   return (
// //     <div>
// //       {isPro ? (
// //         <>
// //           {/* 🔽 Pro-only Bill Upload Feature */}
// //           <div className="border rounded-lg p-4 mb-4">
// //             <h2 className="text-lg font-semibold mb-2">
// //               Upload Bill & Auto-Add Expense
// //             </h2>
// //             <p className="text-sm mb-3 text-gray-700">
// //               Upload a bill image (or PDF). We&apos;ll detect the total amount,
// //               guess the category, and save it directly to your expenses.
// //             </p>

// //             <form onSubmit={handleBillSubmit} className="space-y-3">
// //               <input
// //                 type="file"
// //                 accept="image/*,application/pdf"
// //                 onChange={(e) => {
// //                   setBillFile(e.target.files[0] || null);
// //                   setBillResult(null);
// //                   setUploadError("");
// //                 }}
// //                 className="block w-full text-sm"
// //               />

// //               {uploadError && (
// //                 <p className="text-red-600 text-sm">{uploadError}</p>
// //               )}

// //               <button
// //                 type="submit"
// //                 disabled={!billFile || uploadLoading}
// //                 className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
// //               >
// //                 {uploadLoading ? "Processing..." : "Upload & Detect Expense"}
// //               </button>
// //             </form>

// //             {billResult && (
// //               <div className="mt-4 p-3 rounded border bg-gray-50">
// //                 <p className="font-semibold mb-1">Detected Details:</p>
// //                 <p>
// //                   <span className="font-medium">Category:</span>{" "}
// //                   {billResult.category}
// //                 </p>
// //                 <p>
// //                   <span className="font-medium">Total Amount:</span> ₹
// //                   {billResult.amount}
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         </>
// //       ) : (
// //         <>
// //           <p className="mb-3">
// //             Unlock all premium features with a one-time payment of ₹499.
// //           </p>
// //           <button
// //             onClick={handleProClick}
// //             className="px-4 py-2 rounded bg-blue-600 text-white"
// //           >
// //             Purchase Pro (₹499)
// //           </button>
// //         </>
// //       )}

// //       {/* Popup only shows when user is NOT Pro and clicked the button */}
// //       <PurchaseModal
// //         open={showPurchase}
// //         onClose={() => setShowPurchase(false)}
// //       />
// //     </div>
// //   );
// // }


// import React, { useEffect, useState } from "react";
// import PurchaseModal from "./PurchaseModal";

// const API_BASE = "http://localhost:8000";

// export default function ProFeture() {
//   const [user, setUser] = useState(null);
//   const [showPurchase, setShowPurchase] = useState(false);

//   // 🔽 Pro bill upload state
//   const [billFile, setBillFile] = useState(null);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [billResult, setBillResult] = useState(null);

//   useEffect(() => {
//     const raw = localStorage.getItem("authUser");
//     if (raw) {
//       try {
//         setUser(JSON.parse(raw));
//       } catch (err) {
//         console.error("Invalid authUser in localStorage:", err);
//       }
//     }
//   }, []);

//   const isPro = user?.isPro === true;

//   function handleProClick() {
//     if (isPro) return;
//     setShowPurchase(true);
//   }

//   async function handleBillSubmit(e) {
//     e.preventDefault();
//     setUploadError("");
//     setBillResult(null);

//     const userId = user?._id || user?.id;

//     if (!billFile) {
//       setUploadError("Please select a bill file first.");
//       return;
//     }

//     if (!userId) {
//       setUploadError("User information not found. Please log in again.");
//       return;
//     }

//     try {
//       setUploadLoading(true);

//       const formData = new FormData();
//       formData.append("bill", billFile);
//       formData.append("user_id", userId);

//       const res = await fetch(`${API_BASE}/expense/upload-bill`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.message || "Failed to process bill");
//       }

//       setBillResult({
//         category: data.category,
//         amount: data.amount,
//       });
//     } catch (err) {
//       console.error("Bill upload error:", err);
//       setUploadError(err.message || "Something went wrong");
//     } finally {
//       setUploadLoading(false);
//     }
//   }

//   return (
//     <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-lg">
//       {/* Header */}
//       <div className="flex items-center justify-between gap-3 mb-4">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
//             Pro Features
//           </h2>
//           <p className="text-sm text-gray-600 mt-1">
//             Unlock smarter tools to manage your expenses faster.
//           </p>
//         </div>
//         <span
//           className={`px-3 py-1 rounded-full text-xs font-semibold ${
//             isPro
//               ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
//               : "bg-gray-100 text-gray-600 border border-gray-200"
//           }`}
//         >
//           {isPro ? "PRO ACTIVE" : "PRO LOCKED"}
//         </span>
//       </div>

//       {isPro ? (
//         <>
//           {/* ✅ Pro-only Bill Upload Feature */}
//           <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Upload Bill &amp; Auto-Add Expense
//             </h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Upload a bill image (or PDF). We&apos;ll detect the total amount,
//               guess the category, and save it directly to your expenses.
//             </p>

//             <form onSubmit={handleBillSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Bill file
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*,application/pdf"
//                   onChange={(e) => {
//                     setBillFile(e.target.files[0] || null);
//                     setBillResult(null);
//                     setUploadError("");
//                   }}
//                   className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   Supported formats: images (JPG, PNG, etc.) or PDF.
//                 </p>
//               </div>

//               {uploadError && (
//                 <p className="text-red-600 text-sm">{uploadError}</p>
//               )}

//               <button
//                 type="submit"
//                 disabled={!billFile || uploadLoading}
//                 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {uploadLoading ? "Processing..." : "Upload & Detect Expense"}
//               </button>
//             </form>

//             {billResult && (
//               <div className="mt-5 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60">
//                 <p className="font-semibold text-gray-800 mb-1">
//                   Detected Details
//                 </p>
//                 <p className="text-sm text-gray-700">
//                   <span className="font-medium">Category:</span>{" "}
//                   {billResult.category}
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                   <span className="font-medium">Total Amount:</span> ₹
//                   {billResult.amount}
//                 </p>
//               </div>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           {/* Non-Pro: call to action card */}
//           <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
//             <p className="text-gray-700 mb-3 text-sm sm:text-base">
//               Go <span className="font-semibold text-emerald-600">Pro</span> to
//               enable smart features like Bill Scan &amp; Auto Expense, upcoming
//               insights, and more.
//             </p>
//             <p className="text-xs text-gray-500 mb-4">
//               One-time payment, no subscription. Your existing data stays safe.
//             </p>

//             <button
//               onClick={handleProClick}
//               className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
//             >
//               Purchase Pro (₹499)
//             </button>
//           </div>
//         </>
//       )}

//       {/* Purchase popup for non-Pro users */}
//       <PurchaseModal
//         open={showPurchase}
//         onClose={() => setShowPurchase(false)}
//       />
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import PurchaseModal from "./PurchaseModal";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const API_BASE = "http://localhost:8000";

// const MONTHS = [
//   { index: 0, label: "January", short: "Jan" },
//   { index: 1, label: "February", short: "Feb" },
//   { index: 2, label: "March", short: "Mar" },
//   { index: 3, label: "April", short: "Apr" },
//   { index: 4, label: "May", short: "May" },
//   { index: 5, label: "June", short: "Jun" },
//   { index: 6, label: "July", short: "Jul" },
//   { index: 7, label: "August", short: "Aug" },
//   { index: 8, label: "September", short: "Sep" },
//   { index: 9, label: "October", short: "Oct" },
//   { index: 10, label: "November", short: "Nov" },
//   { index: 11, label: "December", short: "Dec" },
// ];

// export default function ProFeture() {
//   const [user, setUser] = useState(null);
//   const [showPurchase, setShowPurchase] = useState(false);

//   // Bill upload
//   const [billFile, setBillFile] = useState(null);
//   const [uploadLoading, setUploadLoading] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [billResult, setBillResult] = useState(null);

//   // Reports
//   const [reportLoading, setReportLoading] = useState(false);
//   const [reportError, setReportError] = useState("");
//   const [allExpenses, setAllExpenses] = useState([]);
//   const [availableMonths, setAvailableMonths] = useState([]); // [0..11]
//   const [selectedMonth, setSelectedMonth] = useState(null); // 0..11

//   // Load user
//   useEffect(() => {
//     const raw = localStorage.getItem("authUser");
//     if (raw) {
//       try {
//         setUser(JSON.parse(raw));
//       } catch (err) {
//         console.error("Invalid authUser:", err);
//       }
//     }
//   }, []);

//   const isPro = user?.isPro === true;

//   // When Pro + user available, load expenses
//   useEffect(() => {
//     if (isPro && user) {
//       loadExpenses();
//     }
//   }, [isPro, user]);

//   function handleProClick() {
//     if (!isPro) setShowPurchase(true);
//   }

//   // -------- Bill upload --------
//   async function handleBillSubmit(e) {
//     e.preventDefault();
//     setUploadError("");
//     setBillResult(null);

//     const userId = user?._id || user?.id;
//     if (!billFile) return setUploadError("Please select a bill file first.");
//     if (!userId) return setUploadError("User info not found. Please log in.");

//     try {
//       setUploadLoading(true);

//       const formData = new FormData();
//       formData.append("bill", billFile);
//       formData.append("user_id", userId);

//       const res = await fetch(`${API_BASE}/expense/upload-bill`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to process bill");

//       setBillResult({
//         category: data.category,
//         amount: data.amount,
//       });
//     } catch (err) {
//       console.error("Bill upload error:", err);
//       setUploadError(err.message || "Something went wrong");
//     } finally {
//       setUploadLoading(false);
//     }
//   }

//   // -------- Load all expenses once --------
//   async function loadExpenses() {
//     setReportError("");

//     const userId = user?._id || user?.id;
//     if (!userId) return;

//     try {
//       setReportLoading(true);

//       const res = await fetch(
//         `${API_BASE}/expense?user_id=${encodeURIComponent(userId)}`
//       );

//       const contentType = res.headers.get("content-type") || "";
//       if (!contentType.includes("application/json")) {
//         const text = await res.text();
//         console.error("Non-JSON response:", text);
//         throw new Error("Unexpected response from server. Check API URL.");
//       }

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to fetch expenses");

//       const expenses = Array.isArray(data) ? data : data.expenses || [];
//       setAllExpenses(expenses);

//       const monthSet = new Set();
//       expenses.forEach((exp) => {
//         if (!exp.date) return;
//         const d = new Date(exp.date);
//         if (!isNaN(d.getTime())) {
//           monthSet.add(d.getMonth());
//         }
//       });

//       const monthsArr = Array.from(monthSet).sort((a, b) => a - b);
//       setAvailableMonths(monthsArr);

//       const currentMonth = new Date().getMonth();
//       setSelectedMonth(monthSet.has(currentMonth) ? currentMonth : null);
//     } catch (err) {
//       console.error("Load expenses error:", err);
//       setReportError( "Failed to load expenses.");
//     } finally {
//       setReportLoading(false);
//     }
//   }

//   // -------- Core PDF generator (with footer totals, no weird text) --------
//   function generatePdfFromExpenses(expenses, titleSuffix = "") {
//     if (!expenses.length) throw new Error("No expenses found to generate report.");

//     const groups = {};
//     expenses.forEach((exp) => {
//       const date = exp.date ? new Date(exp.date) : null;
//       if (!date || isNaN(date.getTime())) return;

//       const year = date.getFullYear();
//       const monthIndex = date.getMonth();
//       const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
//       const label = date.toLocaleString("default", {
//         month: "long",
//         year: "numeric",
//       });

//       if (!groups[key]) {
//         groups[key] = { label, items: [] };
//       }

//       groups[key].items.push({
//         date: date.toLocaleDateString(),
//         category: exp.category || "Other",
//         description: exp.description || "-",
//         amount: Number(exp.amount) || 0,
//       });
//     });

//     const sortedKeys = Object.keys(groups).sort();

//     const doc = new jsPDF();
//     const userName = user?.name || user?.username || "User";
//     const generatedOn = new Date().toLocaleString();

//     doc.setFontSize(18);
//     doc.text("Expense Report", 14, 18);
//     doc.setFontSize(11);
//     doc.text(`Name: ${userName}`, 14, 26);
//     doc.text(`Generated on: ${generatedOn}`, 14, 32);
//     if (titleSuffix) {
//       doc.text(titleSuffix, 14, 38);
//     }

//     let startY = titleSuffix ? 46 : 42;

//     sortedKeys.forEach((key, index) => {
//       const group = groups[key];

//       if (index > 0 && doc.lastAutoTable) {
//         startY = doc.lastAutoTable.finalY + 12;
//         if (startY > 260) {
//           doc.addPage();
//           startY = 20;
//         }
//       }

//       doc.setFontSize(13);
//       doc.text(group.label, 14, startY);

//       const tableBody = group.items.map((item, idx) => [
//         idx + 1,
//         item.date,
//         item.category,
//         item.description,
//         item.amount.toFixed(2),
//       ]);

//       const monthTotal = group.items.reduce(
//         (sum, item) => sum + item.amount,
//         0
//       );

//       autoTable(doc, {
//         startY: startY + 4,
//         head: [["#", "Date", "Category", "Description", "Amount"]],
//         body: tableBody,
//         // ✅ footer row instead of doc.text → no encoding problems
//         foot: [
//           [
//             {
//               content: `Total for ${group.label}`,
//               colSpan: 4,
//               styles: { halign: "right", fontStyle: "bold" },
//             },
//             {
//               content: monthTotal.toFixed(2), // or `Rs. ${monthTotal.toFixed(2)}`
//               styles: { fontStyle: "bold" },
//             },
//           ],
//         ],
//         styles: { fontSize: 9 },
//         headStyles: {
//           fillColor: [0, 150, 136],
//           textColor: 255,
//         },
//         theme: "striped",
//       });
//     });

//     const safeSuffix = titleSuffix ? titleSuffix.replace(/\s+/g, "_") : "All";
//     doc.save(`Expense_Report_${safeSuffix}.pdf`);
//   }

//   // -------- All-month report --------
//   function handleGenerateAllMonthsReport() {
//     try {
//       setReportError("");
//       if (!allExpenses.length) {
//         throw new Error("No expenses found to generate report.");
//       }
//       generatePdfFromExpenses(allExpenses, "All Months");
//     } catch (err) {
//       console.error("Report generation error:", err);
//       setReportError(err.message || "Failed to generate report.");
//     }
//   }

//   // -------- Selected month report --------
//   function handleGenerateSelectedMonthReport() {
//     try {
//       setReportError("");

//       if (selectedMonth === null || selectedMonth === undefined) {
//         throw new Error("Please select a month from the calendar.");
//       }

//       const filtered = allExpenses.filter((exp) => {
//         if (!exp.date) return false;
//         const d = new Date(exp.date);
//         if (isNaN(d.getTime())) return false;
//         return d.getMonth() === selectedMonth;
//       });

//       const mObj = MONTHS.find((m) => m.index === selectedMonth);
//       const label = mObj?.label || "Selected Month";

//       if (!filtered.length) {
//         throw new Error(`No expenses found for ${label}.`);
//       }

//       generatePdfFromExpenses(filtered, `${label} Only`);
//     } catch (err) {
//       console.error("Report generation error:", err);
//       setReportError(err.message || "Failed to generate report.");
//     }
//   }

//   // -------- UI --------
//   return (
//     <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-lg">
//       {/* Header */}
//       <div className="flex items-center justify-between gap-3 mb-4">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
//             Pro Features
//           </h2>
//           <p className="text-sm text-gray-600 mt-1">
//             Unlock smarter tools to manage your expenses faster.
//           </p>
//         </div>
//         <span
//           className={`px-3 py-1 rounded-full text-xs font-semibold ${
//             isPro
//               ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
//               : "bg-gray-100 text-gray-600 border border-gray-200"
//           }`}
//         >
//           {isPro ? "PRO ACTIVE" : "PRO LOCKED"}
//         </span>
//       </div>

//       {isPro ? (
//         <>
//           {/* Bill Upload Feature */}
//           <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Upload Bill &amp; Auto-Add Expense
//             </h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Upload a bill image (or PDF). We&apos;ll detect the total amount,
//               guess the category, and save it directly to your expenses.
//             </p>

//             <form onSubmit={handleBillSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Bill file
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*,application/pdf"
//                   onChange={(e) => {
//                     setBillFile(e.target.files[0] || null);
//                     setBillResult(null);
//                     setUploadError("");
//                   }}
//                   className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   Supported: images (JPG, PNG, etc.) or PDF.
//                 </p>
//               </div>

//               {uploadError && (
//                 <p className="text-red-600 text-sm">{uploadError}</p>
//               )}

//               <button
//                 type="submit"
//                 disabled={!billFile || uploadLoading}
//                 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {uploadLoading ? "Processing..." : "Upload & Detect Expense"}
//               </button>
//             </form>

//             {billResult && (
//               <div className="mt-5 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60">
//                 <p className="font-semibold text-gray-800 mb-1">
//                   Detected Details
//                 </p>
//                 <p className="text-sm text-gray-700">
//                   <span className="font-medium">Category:</span>{" "}
//                   {billResult.category}
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                   <span className="font-medium">Total Amount:</span> ₹
//                   {billResult.amount}
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Calendar-style Month Report Feature */}
//           <div className="mt-5 bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Download Expense Reports (PDF)
//             </h3>
//             <p className="text-sm text-gray-600 mb-3">
//               Pick a month from the calendar to generate that month&apos;s
//               report, or download a full report of all months.
//             </p>

//             {reportError && (
//               <p className="text-sm text-red-600 mb-2">{reportError}</p>
//             )}

//             {/* Month picker */}
//             <div className="border border-emerald-100 rounded-2xl p-3 sm:p-4 bg-emerald-50/40">
//               <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">
//                 Month Picker
//               </p>

//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                 {MONTHS.map((m) => {
//                   const isAvailable = availableMonths.includes(m.index);
//                   const isSelected = selectedMonth === m.index;

//                   return (
//                     <button
//                       key={m.index}
//                       type="button"
//                       disabled={!isAvailable || reportLoading}
//                       onClick={() => {
//                         if (!isAvailable) return;
//                         setSelectedMonth(m.index);
//                       }}
//                       className={[
//                         "flex flex-col items-start rounded-2xl px-3 py-2 border text-left transition-all duration-150",
//                         isSelected
//                           ? "border-emerald-500 bg-emerald-50 shadow-sm"
//                           : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50",
//                         !isAvailable
//                           ? "opacity-40 cursor-not-allowed bg-gray-50"
//                           : "cursor-pointer",
//                       ].join(" ")}
//                     >
//                       <span className="text-[10px] uppercase tracking-widest text-gray-500">
//                         {m.short}
//                       </span>
//                       <span className="text-sm font-semibold text-gray-800 mt-1">
//                         {m.label}
//                       </span>
//                       <span className="text-[11px] text-gray-500 mt-0.5">
//                         {isAvailable ? "Report available" : "No data"}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>

//               <p className="mt-2 text-[11px] text-gray-500">
//                 Months with no expenses are disabled. Click a card to choose
//                 that month.
//               </p>
//             </div>

//             {/* Action buttons – Option C (📄 icon + text) */}
//             <div className="mt-4 flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={handleGenerateSelectedMonthReport}
//                 disabled={reportLoading}
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 <span>📄</span>
//                 <span>
//                   {reportLoading
//                     ? "Working..."
//                     : "Download Selected Month Report"}
//                 </span>
//               </button>

//               <button
//                 type="button"
//                 onClick={handleGenerateAllMonthsReport}
//                 disabled={reportLoading || !allExpenses.length}
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <span>📄</span>
//                 <span>Download All Months Report</span>
//               </button>
//             </div>

//             <p className="mt-2 text-xs text-gray-500">
//               PDFs will automatically download to your device.
//             </p>
//           </div>
//         </>
//       ) : (
//         <>
//           {/* Non-Pro CTA */}
//           <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
//             <p className="text-gray-700 mb-3 text-sm sm:text-base">
//               Go <span className="font-semibold text-emerald-600">Pro</span> to
//               enable smart features like Bill Scan &amp; Auto Expense, calendar
//               month reports, and more.
//             </p>
//             <p className="text-xs text-gray-500 mb-4">
//               One-time payment, no subscription. Your existing data stays safe.
//             </p>

//             <button
//               onClick={handleProClick}
//               className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
//             >
//               Purchase Pro (₹499)
//             </button>
//           </div>
//         </>
//       )}

//       <PurchaseModal
//         open={showPurchase}
//         onClose={() => setShowPurchase(false)}
//       />
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import PurchaseModal from "./PurchaseModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:8000";

const MONTHS = [
  { index: 0, label: "January", short: "Jan" },
  { index: 1, label: "February", short: "Feb" },
  { index: 2, label: "March", short: "Mar" },
  { index: 3, label: "April", short: "Apr" },
  { index: 4, label: "May", short: "May" },
  { index: 5, label: "June", short: "Jun" },
  { index: 6, label: "July", short: "Jul" },
  { index: 7, label: "August", short: "Aug" },
  { index: 8, label: "September", short: "Sep" },
  { index: 9, label: "October", short: "Oct" },
  { index: 10, label: "November", short: "Nov" },
  { index: 11, label: "December", short: "Dec" },
];

export default function ProFeture() {
  const [user, setUser] = useState(null);
  const [showPurchase, setShowPurchase] = useState(false);

  // Bill upload
  const [billFile, setBillFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [billResult, setBillResult] = useState(null);

  // Reports
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [allExpenses, setAllExpenses] = useState([]);
  const [allIncomes, setAllIncomes] = useState([]); // NEW
  const [availableMonths, setAvailableMonths] = useState([]); // [0..11]
  const [selectedMonth, setSelectedMonth] = useState(null); // 0..11

  // Load user
  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (err) {
        console.error("Invalid authUser:", err);
      }
    }
  }, []);

  const isPro = user?.isPro === true;

  // When Pro + user available, load expenses + incomes
  useEffect(() => {
    if (isPro && user) {
      // load both in parallel and then compute months from combined results
      (async () => {
        setReportLoading(true);
        setReportError("");
        try {
          const [expenses, incomes] = await Promise.all([loadExpenses(), loadIncomes()]);
          // both loaders return arrays (see below)
          const monthSet = new Set();
          (expenses || []).forEach((exp) => {
            if (!exp?.date) return;
            const d = new Date(exp.date);
            if (!isNaN(d.getTime())) monthSet.add(d.getMonth());
          });
          (incomes || []).forEach((inc) => {
            if (!inc?.date) return;
            const d = new Date(inc.date);
            if (!isNaN(d.getTime())) monthSet.add(d.getMonth());
          });

          const monthsArr = Array.from(monthSet).sort((a, b) => a - b);
          setAvailableMonths(monthsArr);

          const currentMonth = new Date().getMonth();
          setSelectedMonth(monthSet.has(currentMonth) ? currentMonth : (monthsArr.length ? monthsArr[monthsArr.length - 1] : null));
        } catch (err) {
          console.error("Load data error:", err);
          setReportError("Failed to load expenses/incomes.");
        } finally {
          setReportLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, user]);

  function handleProClick() {
    if (!isPro) setShowPurchase(true);
  }

  // -------- Bill upload --------
  async function handleBillSubmit(e) {
    e.preventDefault();
    setUploadError("");
    setBillResult(null);

    const userId = user?._id || user?.id;
    if (!billFile) return setUploadError("Please select a bill file first.");
    if (!userId) return setUploadError("User info not found. Please log in.");

    try {
      setUploadLoading(true);

      const formData = new FormData();
      formData.append("bill", billFile);
      formData.append("user_id", userId);

      const res = await fetch(`${API_BASE}/expense/upload-bill`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to process bill");

      setBillResult({
        category: data.category,
        amount: data.amount,
      });
    } catch (err) {
      console.error("Bill upload error:", err);
      setUploadError(err.message || "Something went wrong");
    } finally {
      setUploadLoading(false);
    }
  }

  // -------- Load all expenses once --------
  // NOTE: returns the expenses array for coordination (so useEffect can combine months)
  async function loadExpenses() {
    setReportError("");
    const userId = user?._id || user?.id;
    if (!userId) return [];

    try {
      const res = await fetch(
        `${API_BASE}/expense?user_id=${encodeURIComponent(userId)}`
      );

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response (expenses):", text);
        throw new Error("Unexpected response from server. Check API URL.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch expenses");

      const expenses = Array.isArray(data) ? data : data.expenses || [];
      setAllExpenses(expenses);
      return expenses;
    } catch (err) {
      console.error("Load expenses error:", err);
      setReportError("Failed to load expenses.");
      return [];
    }
  }

  // -------- Load incomes (new) --------
  // NOTE: returns the incomes array for coordination (so useEffect can combine months)
  async function loadIncomes() {
    setReportError("");
    const userId = user?._id || user?.id;
    if (!userId) return [];

    try {
      const res = await fetch(
        `${API_BASE}/income?user_id=${encodeURIComponent(userId)}`
      );

      // be tolerant of different backend shapes
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response (incomes):", text);
        // still return empty
        return [];
      }

      const data = await res.json();
      if (!res.ok) {
        // backend may still return useful body; show message and return []
        console.error("Income fetch not ok:", data);
        return [];
      }

      const incomes = Array.isArray(data) ? data : data.incomes || [];
      setAllIncomes(incomes);
      return incomes;
    } catch (err) {
      console.error("Load incomes error:", err);
      setReportError("Failed to load incomes.");
      return [];
    }
  }

  // -------- Core PDF generator (now accepts incomes too) --------
  function generatePdfFromExpenses(expenses, incomes = [], titleSuffix = "") {
  // if both empty, nothing to show
  if ((!expenses || !expenses.length) && (!incomes || !incomes.length)) {
    throw new Error("No records found to generate report.");
  }

  // Group by YYYY-MM and keep expense & income lists
  const groups = {}; // { '2025-11': { label, expenseItems:[], incomeItems:[] } }

  (expenses || []).forEach((e) => {
    const d = e.date ? new Date(e.date) : null;
    if (!d || isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = { label, expenseItems: [], incomeItems: [] };
    groups[key].expenseItems.push({
      date: d.toLocaleDateString(),
      category: e.category || "Other",
      description: e.description || "-",
      amount: Number(e.amount) || 0,
    });
  });

  (incomes || []).forEach((inc) => {
    const d = inc.date ? new Date(inc.date) : null;
    if (!d || isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = { label, expenseItems: [], incomeItems: [] };
    groups[key].incomeItems.push({
      date: d.toLocaleDateString(),
      category: inc.category || "Other",
      description: inc.description || "-",
      amount: Number(inc.amount) || 0,
    });
  });

  const keys = Object.keys(groups).sort();

  // --- Create PDF ---
  const doc = new jsPDF();
  const userName = user?.name || user?.username || "User";
  const generatedOn = new Date().toLocaleString();

  doc.setFontSize(18);
  doc.text("Income & Expense Report", 14, 18);
  doc.setFontSize(11);
  doc.text(`Name: ${userName}`, 14, 26);
  doc.text(`Generated on: ${generatedOn}`, 14, 32);
  if (titleSuffix) doc.text(titleSuffix, 14, 38);

  let cursorY = titleSuffix ? 46 : 42;
  let grandTotalExpense = 0;
  let grandTotalIncome = 0;

  keys.forEach((k, idx) => {
    const g = groups[k];
    const expensesBody = (g.expenseItems || []).map((it, i) => [
      i + 1,
      it.date,
      it.category,
      it.description,
      it.amount.toFixed(2),
    ]);
    const monthExpenseTotal = (g.expenseItems || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    grandTotalExpense += monthExpenseTotal;

    // Start below last table if any
    if (idx > 0 && doc.lastAutoTable) {
      cursorY = doc.lastAutoTable.finalY + 12;
      if (cursorY > 260) {
        doc.addPage();
        cursorY = 20;
      }
    }

    doc.setFontSize(13);
    doc.text(g.label, 14, cursorY);
    cursorY += 6;

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Date", "Category", "Description", "Amount"]],
      body: expensesBody.length ? expensesBody : [["-", "-", "-", "No expense records", "-"]],
      foot: [
        [
          {
            content: `Total Expense for ${g.label}`,
            colSpan: 4,
            styles: { halign: "right", fontStyle: "bold" },
          },
          { content: monthExpenseTotal.toFixed(2), styles: { fontStyle: "bold" } },
        ],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 150, 136], textColor: 255 },
      theme: "striped",
    });

    cursorY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : cursorY) + 8;

    // Income table (if any) and month income total
    const incomeBody = (g.incomeItems || []).map((it, i) => [
      i + 1,
      it.date,
      it.category,
      it.description,
      it.amount.toFixed(2),
    ]);
    const monthIncomeTotal = (g.incomeItems || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    grandTotalIncome += monthIncomeTotal;

    if (incomeBody.length) {
      autoTable(doc, {
        startY: cursorY,
        head: [["#", "Date", "Category", "Description", "Amount (Income)"]],
        body: incomeBody,
        foot: [
          [
            {
              content: `Total Income for ${g.label}`,
              colSpan: 4,
              styles: { halign: "right", fontStyle: "bold" },
            },
            { content: monthIncomeTotal.toFixed(2), styles: { fontStyle: "bold" } },
          ],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 136, 229], textColor: 255 },
        theme: "grid",
      });
      cursorY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : cursorY) + 8;
    } else {
      // small note that income is zero for this month
      doc.setFontSize(11);
      doc.text(`Total Income: Rs. 0.00`, 14, cursorY);
      cursorY += 8;
    }

    // NOTE: per-month saving row removed by user's request (no per-month saving printed)

    // separator
    doc.setLineWidth(0.2);
    doc.line(14, cursorY - 4, 196, cursorY - 4);

    if (cursorY > 250 && idx < keys.length - 1) {
      doc.addPage();
      cursorY = 18;
    }
  });

  // --- Overall summary only ---
  if (cursorY > 230) {
    doc.addPage();
    cursorY = 18;
  }
  doc.setFontSize(14);
  doc.text("Overall Summary", 14, cursorY + 6);
  cursorY += 12;
  doc.setFontSize(11);
  const overallSaving = grandTotalIncome - grandTotalExpense;
  doc.text(`Total Income (all months): Rs. ${grandTotalIncome.toFixed(2)}`, 14, cursorY); cursorY += 8;
  doc.text(`Total Expense (all months): Rs. ${grandTotalExpense.toFixed(2)}`, 14, cursorY); cursorY += 8;
  doc.text(`Total Actual Saving: Rs. ${overallSaving.toFixed(2)}`, 14, cursorY); cursorY += 8;

  const safeSuffix = titleSuffix ? String(titleSuffix).replace(/\s+/g, "_") : "All";
  doc.save(`IncomeExpense_Report_${safeSuffix}.pdf`);
}


  // -------- All-month report (handler) --------
  function handleGenerateAllMonthsReport() {
    try {
      setReportError("");
      if (!allExpenses.length && !allIncomes.length) {
        throw new Error("No records found to generate report.");
      }
      generatePdfFromExpenses(allExpenses, allIncomes, "All Months");
    } catch (err) {
      console.error("Report generation error:", err);
      setReportError(err.message || "Failed to generate report.");
    }
  }

  // -------- Selected month report (handler) --------
  function handleGenerateSelectedMonthReport() {
    try {
      setReportError("");

      if (selectedMonth === null || selectedMonth === undefined) {
        throw new Error("Please select a month from the calendar.");
      }

      // For year ambiguity, we filter by month only (keeps original behavior)
      const filteredExpenses = allExpenses.filter((exp) => {
        if (!exp?.date) return false;
        const d = new Date(exp.date);
        if (isNaN(d.getTime())) return false;
        return d.getMonth() === selectedMonth;
      });

      const filteredIncomes = allIncomes.filter((inc) => {
        if (!inc?.date) return false;
        const d = new Date(inc.date);
        if (isNaN(d.getTime())) return false;
        return d.getMonth() === selectedMonth;
      });

      const mObj = MONTHS.find((m) => m.index === selectedMonth);
      const label = mObj?.label || "Selected Month";

      if (!filteredExpenses.length && !filteredIncomes.length) {
        throw new Error(`No records found for ${label}.`);
      }

      generatePdfFromExpenses(filteredExpenses, filteredIncomes, `${label} Only`);
    } catch (err) {
      console.error("Report generation error:", err);
      setReportError(err.message || "Failed to generate report.");
    }
  }

  // -------- UI --------
  return (
    <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-lg"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Pro Features
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Unlock smarter tools to manage your expenses faster.
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPro
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isPro ? "PRO ACTIVE" : "PRO LOCKED"}
        </span>
      </div>

      {isPro ? (
        <>
          {/* Bill Upload Feature */}
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload Bill &amp; Auto-Add Expense
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a bill image (or PDF). We&apos;ll detect the total amount,
              guess the category, and save it directly to your expenses.
            </p>

            <form onSubmit={handleBillSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Bill file
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    setBillFile(e.target.files[0] || null);
                    setBillResult(null);
                    setUploadError("");
                  }}
                  className="block w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported: images (JPG, PNG, etc.) or PDF.
                </p>
              </div>

              {uploadError && (
                <p className="text-red-600 text-sm">{uploadError}</p>
              )}

              <button
                type="submit"
                disabled={!billFile || uploadLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploadLoading ? "Processing..." : "Upload & Detect Expense"}
              </button>
            </form>

            {billResult && (
              <div className="mt-5 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60">
                <p className="font-semibold text-gray-800 mb-1">
                  Detected Details
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Category:</span>{" "}
                  {billResult.category}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Total Amount:</span> ₹
                  {billResult.amount}
                </p>
              </div>
            )}
          </div>

          {/* Calendar-style Month Report Feature */}
          <div className="mt-5 bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Download Expense Reports (PDF)
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Pick a month from the calendar to generate that month&apos;s
              report, or download a full report of all months.
            </p>

            {reportError && (
              <p className="text-sm text-red-600 mb-2">{reportError}</p>
            )}

            {/* Month picker */}
            <div className="border border-emerald-100 rounded-2xl p-3 sm:p-4 bg-emerald-50/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">
                Month Picker
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {MONTHS.map((m) => {
                  const isAvailable = availableMonths.includes(m.index);
                  const isSelected = selectedMonth === m.index;

                  return (
                    <button
                      key={m.index}
                      type="button"
                      disabled={!isAvailable || reportLoading}
                      onClick={() => {
                        if (!isAvailable) return;
                        setSelectedMonth(m.index);
                      }}
                      className={[
                        "flex flex-col items-start rounded-2xl px-3 py-2 border text-left transition-all duration-150",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50",
                        !isAvailable
                          ? "opacity-40 cursor-not-allowed bg-gray-50"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">
                        {m.short}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 mt-1">
                        {m.label}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5">
                        {isAvailable ? "Report available" : "No data"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                Months with no expenses or incomes are disabled. Click a card to choose
                that month.
              </p>
            </div>

            {/* Action buttons – Option C (📄 icon + text) */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGenerateSelectedMonthReport}
                disabled={reportLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span>📄</span>
                <span>
                  {reportLoading
                    ? "Working..."
                    : "Download Selected Month Report"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAllMonthsReport}
                disabled={reportLoading || (!allExpenses.length && !allIncomes.length)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📄</span>
                <span>Download All Months Report</span>
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              PDFs will automatically download to your device.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Non-Pro CTA */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
            <p className="text-gray-700 mb-3 text-sm sm:text-base">
              Go <span className="font-semibold text-emerald-600">Pro</span> to
              enable smart features like Bill Scan &amp; Auto Expense, calendar
              month reports, and more.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              One-time payment, no subscription. Your existing data stays safe.
            </p>

            <button
              onClick={handleProClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Purchase Pro (₹499)
            </button>
          </div>
        </>
      )}

      <PurchaseModal
        open={showPurchase}
        onClose={() => setShowPurchase(false)}
      />
    </div>
  );
}


