// frontend/src/components/Login.jsx
import React, { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // Shared form styles

// Pass setCurrentUser from App to update the global state upon login
const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // For success or general error messages
  const [errors, setErrors] = useState({}); // For specific field errors
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Client-side validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      // Basic email format check
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setErrors({}); // Clear previous field errors

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);
    try {
      const responseData = await authService.login({ email, password });
      // authService.login already stores user in localStorage
      setCurrentUser(responseData); // Update App's state
      setMessage(responseData.message + ". Redirecting to profile...");
      setTimeout(() => {
        navigate("/profile", { replace: true }); // Replace login history entry
      }, 1000); // Delay for user to read message
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) || // Backend error message
        error.message ||
        error.toString();
      setMessage(resMessage); // Display general error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login to Your Account</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="error-text">
              {errors.email}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="error-text">
              {errors.password}
            </p>
          )}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging In..." : "Login"}
        </button>
      </form>
      {/* Display general success/error message */}
      {message && (
        <p
          className={
            Object.keys(errors).length > 0 ||
            message.toLowerCase().includes("invalid") ||
            message.toLowerCase().includes("error")
              ? "error-text"
              : "success-text"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
