// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import authService from "./services/authService.js";
import "./App.css"; // Main app styles

// Helper component for NavLink active state
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
};

function App() {
  // Initialize currentUser from localStorage
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // This effect will run when currentUser state changes,
  // typically after login or logout to re-render the navbar.
  useEffect(() => {
    // If you need to do something when currentUser changes, do it here.
    // For now, just having it in state is enough to trigger re-renders.
  }, [currentUser]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null); // Update state to re-render navbar
    // Navigation to /login will be handled by the Routes logic
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            UserAuth
          </Link>
          <ul className="nav-links">
            {currentUser && currentUser.token ? ( // Check for token specifically
              <>
                <li>
                  <NavLink to="/profile">Profile</NavLink>
                </li>
                <li>
                  {/* Use a button or styled link for logout for better semantics */}
                  <a
                    href="/login"
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="container">
          {" "}
          {/* Main content wrapper */}
          <Routes>
            <Route
              path="/"
              element={
                currentUser && currentUser.token ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                currentUser && currentUser.token ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <Register />
                )
              }
            />
            <Route
              path="/login"
              element={
                currentUser && currentUser.token ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <Login setCurrentUser={setCurrentUser} />
                )
              }
            />
            <Route
              path="/profile"
              element={
                currentUser && currentUser.token ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Fallback for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
