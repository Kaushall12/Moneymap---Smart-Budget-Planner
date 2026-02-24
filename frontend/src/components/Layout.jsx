// import React, { useContext } from "react";
// import { Home, TrendingDown, User, Wallet, LogOut } from "lucide-react";
// import { NavLink, useNavigate, Outlet } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function Layout() {
//   const { logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout(); // clear context state
//     navigate("/", { replace: true }); // redirect to login
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-36 bg-slate-900 text-slate-100 flex flex-col items-center py-6">
//         <SidebarItem to="/dashboard" icon={<Home className="h-6 w-6" />} label="Dashboard" />
//         <SidebarItem to="/income" icon={<Wallet className="h-6 w-6" />} label="Income" />
//         <SidebarItem to="/expenses" icon={<TrendingDown className="h-6 w-6" />} label="Expenses" />
//         <SidebarItem to="/budgets" icon={<User className="h-6 w-6" />} label="Budget" />
//         <SidebarItem to="/profile" icon={<User className="h-6 w-6" />} label="Profile" />
//         <SidebarItem to="/profeture" icon={<Wallet className="h-6 w-6" />} label="Pro Feature" />
//         <div className="mt-auto" />
//         {/* Logout button */}
//         <button
//           onClick={handleLogout}
//           className="flex flex-col items-center gap-2 py-4 w-full text-slate-200 hover:bg-slate-800/50"
//         >
//           <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800/70">
//             <LogOut />
//           </div>
//           <span className="text-sm">Logout</span>
//         </button>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// /* Sidebar Item */
// function SidebarItem({ to, icon, label }) {
//   return (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex flex-col items-center gap-2 py-4 w-full transition ${
//           isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800/50"
//         }`
//       }
//     >
//       <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800/70">
//         {icon}
//       </div>
//       {label ? <span className="text-sm">{label}</span> : null}
//     </NavLink>
//   );
// }


// import React, { useContext, useEffect, useState } from "react";
// import { Home, TrendingDown, User, Wallet, LogOut } from "lucide-react";
// import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
// import PurchaseModal from "./PurchaseModal";
// import { AuthContext } from "../context/AuthContext";

// export default function Layout() {
//   const { logout, user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const isPro = !!(user && user.isPro === true);

//   // Only show the purchase modal when route is /profeture AND user is NOT Pro
//   const isProRoute = location.pathname === "/profeture";
//   const [showPurchaseModal, setShowPurchaseModal] = useState(isProRoute && !isPro);

//   useEffect(() => {
//     setShowPurchaseModal(isProRoute && !isPro);
//   }, [isProRoute, isPro]);

//   const handleLogout = () => {
//     logout();
//     // Optionally clear localStorage tokens here if you want
//     // localStorage.removeItem("authToken");
//     // localStorage.removeItem("authUser");
//     navigate("/", { replace: true });
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-36 bg-slate-900 text-slate-100 flex flex-col items-center py-6">
//         <SidebarItem to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
//         <SidebarItem to="/income" icon={<Wallet size={20} />} label="Income" />
//         <SidebarItem to="/expenses" icon={<TrendingDown size={20} />} label="Expenses" />
//         <SidebarItem to="/budgets" icon={<User size={20} />} label="Budget" />
//         <SidebarItem to="/profile" icon={<User size={20} />} label="Profile" />

//         {/* Hide Pro link once user is Pro */}
//         { <SidebarItem to="/profeture" icon={<Wallet size={20} />} label="Pro Feature" />}

//         <div className="mt-auto" />

//         {/* Logout button */}
//         <button
//           onClick={handleLogout}
//           className="flex flex-col items-center gap-2 py-4 w-full text-slate-200 hover:bg-slate-800/50"
//         >
//           <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800/70">
//             <LogOut size={20} />
//           </div>
//           <span className="text-sm">Logout</span>
//         </button>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-8">
//         {/* Purchase modal shown only for non-Pro users */}
//         <PurchaseModal
//           open={showPurchaseModal}
//           onClose={() => {
//             setShowPurchaseModal(false);
//             navigate("/dashboard");
//           }}
//         />
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// /* Sidebar Item */
// function SidebarItem({ to, icon, label }) {
//   return (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex flex-col items-center gap-2 py-4 w-full transition ${
//           isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800/50"
//         }`
//       }
//     >
//       <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800/70">
//         {icon}
//       </div>
//       {label ? <span className="text-sm">{label}</span> : null}
//     </NavLink>
//   );
// }

import React, { useContext, useEffect, useState } from "react";
import { Home, TrendingDown, User, Wallet, LogOut, Menu, X } from "lucide-react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import PurchaseModal from "./PurchaseModal";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isPro = !!(user && user.isPro === true);

  // Only show the purchase modal when route is /profeture AND user is NOT Pro
  const isProRoute = location.pathname === "/profeture";
  const [showPurchaseModal, setShowPurchaseModal] = useState(isProRoute && !isPro);

  // ✅ mobile hamburger toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setShowPurchaseModal(isProRoute && !isPro);
  }, [isProRoute, isPro]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100"
    style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}>
      {/* small CSS for animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu-anim {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>

      {/* Desktop sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-40 xl:w-52 bg-slate-950 text-slate-100 flex-col items-center py-8 px-2 gap-2 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="h-11 w-11 rounded-2xl bg-slate-800 flex items-center justify-center shadow-md">
            <Wallet size={22} />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Money Map
          </span>
        </div>

        <SidebarItem to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
        <SidebarItem to="/income" icon={<Wallet size={18} />} label="Incomes" />
        <SidebarItem to="/expenses" icon={<TrendingDown size={18} />} label="Expenses" />
        <SidebarItem to="/budgets" icon={<User size={18} />} label="Budget" />
        <SidebarItem to="/profile" icon={<User size={18} />} label="Profile" />
        <SidebarItem to="/profeture" icon={<Wallet size={18} />} label="Pro Feature" />

        <div className="mt-auto w-full">
          <button
            onClick={handleLogout}
            className="mt-4 flex flex-col items-center gap-2 py-3 w-full text-slate-200 hover:bg-slate-800/70 rounded-2xl transition"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-800/80">
              <LogOut size={18} />
            </div>
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Right side: mobile header + main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar (hidden on desktop) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center shadow">
              <Wallet size={20} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-wide">
                Money Map
              </span>
              <span className="text-xs text-slate-300">
                Track income & expenses
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center shadow active:scale-95 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-slate-950 text-slate-50 border-b border-slate-800 shadow-lg mobile-menu-anim">
            <div className="flex flex-col px-3 py-2">
              <SidebarItem
                to="/dashboard"
                icon={<Home size={18} />}
                label="Dashboard"
                onClick={() => setMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/income"
                icon={<Wallet size={18} />}
                label="Incomes"
                onClick={() => setMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/expenses"
                icon={<TrendingDown size={18} />}
                label="Expenses"
                onClick={() => setMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/budgets"
                icon={<User size={18} />}
                label="Budget"
                onClick={() => setMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/profile"
                icon={<User size={18} />}
                label="Profile"
                onClick={() => setMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/profeture"
                icon={<Wallet size={18} />}
                label="Pro Feature"
                onClick={() => setMobileMenuOpen(false)}
              />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 flex items-center justify-between px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-sm text-slate-100 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <LogOut size={18} />
                  </div>
                  <span>Logout</span>
                </div>
                <span className="text-[11px] text-slate-400">Sign out</span>
              </button>
            </div>
          </nav>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <PurchaseModal
            open={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false);
              navigate("/dashboard");
            }}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* Sidebar Item */
function SidebarItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition",
          "text-sm md:text-[13px]",
          "mb-1",
          isActive
            ? "bg-slate-800 text-white shadow-inner"
            : "text-slate-200 hover:bg-slate-800/70",
        ].join(" ")
      }
    >
      <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900/70">
        {icon}
      </div>
      {label ? <span className="font-medium">{label}</span> : null}
    </NavLink>
  );
}
