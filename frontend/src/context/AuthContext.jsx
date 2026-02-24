import React, { createContext, useState, useEffect } from "react";

// Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Persist token & user in localStorage whenever they change
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
  }, [token, user]);

  // Login function
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Optional: Helper to check if user is authenticated
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
