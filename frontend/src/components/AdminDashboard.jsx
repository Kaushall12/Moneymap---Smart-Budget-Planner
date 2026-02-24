// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const API_BASE = "http://localhost:8000";

// export default function AdminDashboard() {
//   const { token, user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // ✅ If not logged in OR not admin, send back to login
//     if (!token || !user) {
//       navigate("/", { replace: true });
//       return;
//     }

//     // If you're using role-based admin, uncomment this:
//     // if (user.role !== "admin") {
//     //   setError("You are not authorized to view this page.");
//     //   setLoading(false);
//     //   return;
//     // }

//     async function fetchStats() {
//       try {
//         const res = await fetch(`${API_BASE}/admin/pro-stats`, {
//           headers: {
//             // ✅ send the JWT from AuthContext
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();

//         if (!res.ok || !data.success) {
//           setError(data.message || "Failed to load stats");
//         } else {
//           setStats(data);
//         }
//       } catch (err) {
//         console.error("Admin stats error:", err);
//         setError("Server error");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, [token, user, navigate]);

//   const handleLogout = () => {
//     logout();             // clears authToken + authUser in localStorage
//     navigate("/");   // back to login page
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
//         Loading admin dashboard...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-red-400 gap-4">
//         <div>{error}</div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }

//   const { totals, proUsers, freeUsers } = stats;

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
//       {/* Top bar with Logout */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
//           {user && (
//             <p className="text-sm text-slate-300 mt-1">
//               Logged in as: {user.name} ({user.email})
//             </p>
//           )}
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <SummaryCard label="Total Users" value={totals.totalUsers} />
//         <SummaryCard label="Pro Users" value={totals.proUsers} />
//         <SummaryCard label="Free Users" value={totals.freeUsers} />
//       </div>

//       {/* Pro Users Table */}
//       <div className="bg-slate-800/60 rounded-xl p-4">
//         <h2 className="text-xl font-semibold mb-3">Pro Users</h2>
//         <UserTable users={proUsers} emptyText="No Pro users yet" />
//       </div>

//       {/* Free Users Table */}
//       <div className="bg-slate-800/60 rounded-xl p-4">
//         <h2 className="text-xl font-semibold mb-3">Free Users</h2>
//         <UserTable users={freeUsers} emptyText="No free users" />
//       </div>
//     </div>
//   );
// }

// function SummaryCard({ label, value }) {
//   return (
//     <div className="bg-slate-800/60 rounded-xl p-4">
//       <div className="text-sm text-slate-300">{label}</div>
//       <div className="text-2xl font-bold mt-2">{value}</div>
//     </div>
//   );
// }

// function UserTable({ users, emptyText }) {
//   if (!users || users.length === 0) {
//     return <div className="text-sm text-slate-300">{emptyText}</div>;
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full text-sm">
//         <thead>
//           <tr className="text-left border-b border-slate-700">
//             <th className="py-2 pr-4">Name</th>
//             <th className="py-2 pr-4">Email</th>
//             <th className="py-2 pr-4">Mobile</th>
//             <th className="py-2 pr-4">Pro?</th>
//             <th className="py-2 pr-4">Pro Purchased At</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u._id} className="border-b border-slate-800">
//               <td className="py-1 pr-4">{u.name}</td>
//               <td className="py-1 pr-4">{u.email}</td>
//               <td className="py-1 pr-4">{u.mobile}</td>
//               <td className="py-1 pr-4">{u.isPro ? "Yes" : "No"}</td>
//               <td className="py-1 pr-4">
//                 {u.proInfo?.purchasedAt || u.lastPayment?.verifiedAt || "-"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const API_BASE = "http://localhost:8000";

// export default function AdminDashboard() {
//   const { token, user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // If not logged in, go back to login
//     if (!token || !user) {
//       navigate("/", { replace: true });
//       return;
//     }

//     async function fetchStats() {
//       try {
//         const res = await fetch(`${API_BASE}/admin/pro-stats`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();

//         if (!res.ok || !data.success) {
//           setError(data.message || "Failed to load stats");
//         } else {
//           setStats(data);
//         }
//       } catch (err) {
//         console.error("Admin stats error:", err);
//         setError("Server error");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, [token, user, navigate]);

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-emerald-50 text-gray-700">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm font-medium">Loading admin dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-rose-50 to-orange-50 text-red-600 gap-4">
//         <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-red-200 max-w-md text-center">
//           {error}
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-md text-sm font-semibold"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }

//   const { totals, proUsers, freeUsers } = stats;

//   // Data for dual-color bar chart
//   const barData = [
//     {
//       name: "Users",
//       pro: totals.proUsers,
//       free: totals.freeUsers,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-emerald-50 text-gray-800">
//       <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
//         {/* Top bar */}
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 md:px-6 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-lg">
//               {user?.name?.[0]?.toUpperCase() || "A"}
//             </div>
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
//                 Admin Dashboard
//               </h1>
//               {user && (
//                 <p className="text-xs md:text-sm text-gray-500 mt-1">
//                   Logged in as{" "}
//                   <span className="font-semibold text-gray-700">
//                     {user.name}
//                   </span>{" "}
//                   ({user.email})
//                 </p>
//               )}
//             </div>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm text-sm font-semibold"
//           >
//             Logout
//           </button>
//         </div>

//         {/* Stat cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           <StatCard
//             label="Total Users"
//             value={totals.totalUsers}
//             color="gray"
//             chip="All non-admin users"
//           />
//           <StatCard
//             label="Pro Users"
//             value={totals.proUsers}
//             color="green"
//             chip="Using Pro features"
//           />
//           <StatCard
//             label="Free Users"
//             value={totals.freeUsers}
//             color="blue"
//             chip="On free plan"
//           />
//         </div>

//         {/* Bar chart */}
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">Pro vs Free Users</h2>
//             <span className="text-xs md:text-sm text-gray-500">
//               Quick visual comparison
//             </span>
//           </div>
//           <div className="w-full h-80">
//             <ResponsiveContainer>
//               <BarChart data={barData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                 <XAxis dataKey="name" />
//                 <YAxis allowDecimals={false} />
//                 <Tooltip />
//                 <Legend />
//                 <Bar
//                   dataKey="pro"
//                   name="Pro Users"
//                   fill="#10B981"
//                   radius={[6, 6, 0, 0]}
//                   barSize={60}
//                 />
//                 <Bar
//                   dataKey="free"
//                   name="Free Users"
//                   fill="#3B82F6"
//                   radius={[6, 6, 0, 0]}
//                   barSize={60}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Pro users table */}
//         <UserSection
//           title="Pro Users"
//           accentColor="green"
//           users={proUsers}
//           emptyText="No Pro users yet."
//         />

//         {/* Free users table */}
//         <UserSection
//           title="Free Users"
//           accentColor="blue"
//           users={freeUsers}
//           emptyText="No free users found."
//         />
//       </div>
//     </div>
//   );
// }

// /* ---------- Small components ---------- */

// function StatCard({ label, value, color, chip }) {
//   const colorMap = {
//     green: "text-emerald-600 bg-emerald-50",
//     blue: "text-blue-600 bg-blue-50",
//     gray: "text-gray-700 bg-gray-50",
//   };

//   const pillColorMap = {
//     green: "text-emerald-700 bg-emerald-50",
//     blue: "text-blue-700 bg-blue-50",
//     gray: "text-gray-600 bg-gray-100",
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-2">
//       <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//         {label}
//       </p>
//       <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
//       {chip && (
//         <span
//           className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-medium ${pillColorMap[color]}`}
//         >
//           {chip}
//         </span>
//       )}
//     </div>
//   );
// }

// function UserSection({ title, accentColor, users, emptyText }) {
//   const borderMap = {
//     green: "border-emerald-200",
//     blue: "border-blue-200",
//   };
//   const titleMap = {
//     green: "text-emerald-700",
//     blue: "text-blue-700",
//   };

//   return (
//     <div
//       className={`bg-white border ${borderMap[accentColor]} rounded-2xl shadow-sm p-5 md:p-6`}
//     >
//       <div className="flex items-center justify-between mb-3">
//         <h2 className={`text-xl font-semibold ${titleMap[accentColor]}`}>
//           {title}
//         </h2>
//         <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
//       </div>
//       <UserTable users={users} emptyText={emptyText} />
//     </div>
//   );
// }

// function UserTable({ users, emptyText }) {
//   if (!users || users.length === 0) {
//     return <p className="text-sm text-gray-500">{emptyText}</p>;
//   }

//   return (
//     <div className="overflow-x-auto mt-2">
//       <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden bg-white">
//         <thead className="bg-gray-50">
//           <tr className="text-left border-b border-gray-200">
//             <th className="py-2.5 px-4">Name</th>
//             <th className="py-2.5 px-4">Email</th>
//             <th className="py-2.5 px-4">Mobile</th>
//             <th className="py-2.5 px-4">Pro</th>
//             <th className="py-2.5 px-4">Pro Purchased At</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr
//               key={u._id}
//               className="border-b border-gray-100 hover:bg-gray-50 transition"
//             >
//               <td className="py-2.5 px-4">{u.name}</td>
//               <td className="py-2.5 px-4">{u.email}</td>
//               <td className="py-2.5 px-4">{u.mobile}</td>
//               <td className="py-2.5 px-4">
//                 {u.isPro ? (
//                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
//                     Pro
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
//                     Free
//                   </span>
//                 )}
//               </td>
//               <td className="py-2.5 px-4">
//                 {u.proInfo?.purchasedAt || u.lastPayment?.verifiedAt || "-"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// NEW imports for PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:8000";

export default function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // If not logged in, go back to login
    if (!token || !user) {
      navigate("/", { replace: true });
      return;
    }

    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/admin/pro-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load stats");
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error("Admin stats error:", err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [token, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ---------- NEW: PDF generation ----------
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return String(d);
      return dt.toLocaleString(); // uses browser locale
    } catch {
      return String(d);
    }
  };

const generatePdfReport = () => {
  if (!stats) return;

  const combined = [...(stats.proUsers || []), ...(stats.freeUsers || [])];

  const rows = combined.map((u) => [
    u.name || "-",
    u.email || "-",
    u.mobile || "-",
    u.isPro ? "Pro" : "Free",
    u.proInfo?.purchasedAt || u.lastPayment?.verifiedAt || "-",
  ]);

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text("Users Pro Report", 40, 40);

  autoTable(doc, {
    startY: 60,
    head: [["Name", "Email", "Mobile", "Plan", "Purchased At"]],
    body: rows,
    styles: { fontSize: 9 },
  });

  doc.save("users-pro-report.pdf");
};

  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-emerald-50 text-gray-700"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-rose-50 to-orange-50 text-red-600 gap-4"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
        <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-red-200 max-w-md text-center">
          {error}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-md text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    );
  }

  const { totals, proUsers, freeUsers } = stats;

  // Data for dual-color bar chart
  const barData = [
    {
      name: "Users",
      pro: totals.proUsers,
      free: totals.freeUsers,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-emerald-50 text-gray-800"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
        {/* Top bar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-lg">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              {user && (
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Logged in as{" "}
                  <span className="font-semibold text-gray-700">
                    {user.name}
                  </span>{" "}
                  ({user.email})
                </p>
              )}
            </div>
          </div>

          {/* Single button requested: Generate PDF report */}
          <div className="flex items-center gap-3">
            <button
              onClick={generatePdfReport}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-sm text-sm font-semibold"
              title="Generate PDF report of users and Pro status"
            >
              Export Users Report (PDF)
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            label="Total Users"
            value={totals.totalUsers}
            color="gray"
            chip="All non-admin users"
          />
          <StatCard
            label="Pro Users"
            value={totals.proUsers}
            color="gray"
            chip="Using Pro features"
          />
          <StatCard
            label="Free Users"
            value={totals.freeUsers}
            color="gray"
            chip="On free plan"
          />
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pro vs Free Users</h2>
            <span className="text-xs md:text-sm text-gray-500">
              Quick visual comparison
            </span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="pro"
                  name="Pro Users"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
                <Bar
                  dataKey="free"
                  name="Free Users"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pro users table */}
        <UserSection
          title="Pro Users"
          accentColor="green"
          users={proUsers}
          emptyText="No Pro users yet."
        />

        {/* Free users table */}
        <UserSection
          title="Free Users"
          accentColor="blue"
          users={freeUsers}
          emptyText="No free users found."
        />
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function StatCard({ label, value, color, chip }) {
  const colorMap = {
    green: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    gray: "text-gray-700 bg-gray-50",
  };

  const pillColorMap = {
    green: "text-emerald-700 bg-emerald-50",
    blue: "text-blue-700 bg-blue-50",
    gray: "text-gray-600 bg-gray-100",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-2"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      {chip && (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-medium ${pillColorMap[color]}`}
        >
          {chip}
        </span>
      )}
    </div>
  );
}

function UserSection({ title, accentColor, users, emptyText }) {
  const borderMap = {
    green: "border-emerald-200",
    blue: "border-blue-200",
  };
  const titleMap = {
    green: "text-emerald-700",
    blue: "text-blue-700",
  };

  return (
    <div
      className={`bg-white border ${borderMap[accentColor]} rounded-2xl shadow-sm p-5 md:p-6`}
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-xl font-semibold ${titleMap[accentColor]}`}>
          {title}
        </h2>
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
      </div>
      <UserTable users={users} emptyText={emptyText} />
    </div>
  );
}

function UserTable({ users, emptyText }) {
  if (!users || users.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto mt-2"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden bg-white">
        <thead className="bg-gray-50">
          <tr className="text-left border-b border-gray-200">
            <th className="py-2.5 px-4">Name</th>
            <th className="py-2.5 px-4">Email</th>
            <th className="py-2.5 px-4">Mobile</th>
            <th className="py-2.5 px-4">Pro</th>
            <th className="py-2.5 px-4">Pro Purchased At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <td className="py-2.5 px-4">{u.name}</td>
              <td className="py-2.5 px-4">{u.email}</td>
              <td className="py-2.5 px-4">{u.mobile}</td>
              <td className="py-2.5 px-4">
                {u.isPro ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    Free
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4">
                {u.proInfo?.purchasedAt || u.lastPayment?.verifiedAt || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



