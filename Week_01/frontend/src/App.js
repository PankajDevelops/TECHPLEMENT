import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import authService from "./services/authService";
import "./App.css";

function App() {
  const currentUser = authService.getCurrentUser();

  return (
    <Router>
      <div>
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            UserAuth
          </Link>
          <ul className="nav-links">
            {currentUser ? (
              <>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <a href="/login" onClick={() => authService.logout()}>
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="container">
          <Routes>
            <Route
              path="/"
              element={
                currentUser ? (
                  <Navigate to="/profile" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            {/* Add a catch-all or 404 page if desired */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
