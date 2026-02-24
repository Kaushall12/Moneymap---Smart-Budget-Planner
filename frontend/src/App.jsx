import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Forgot from "./components/Forgot";
import Income from "./components/Income";
import Profile from "./components/Profile";
import Expenses from "./components/Expenses";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import Budget from "./components/Budget";
import ProFeture from "./components/ProFeture";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budget />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profeture" element={<ProFeture />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
