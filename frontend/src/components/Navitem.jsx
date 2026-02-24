import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Income from "./Income";
import Expenses from "./Expenses";
import Profile from "./Profile";
import Login from "./Login";
function NavItem() {
  return (
    <Router>
      <Layout>
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}
export default NavItem;