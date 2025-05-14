// frontend/src/components/Register.jsx
import React, { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // Shared form styles

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // For success or general error messages
  const [errors, setErrors] = useState({}); // For specific field errors
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Client-side validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      // Basic email format check
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setErrors({}); // Clear previous field errors

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      setMessage(response.data.message + ". Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Delay for user to read message
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) || // Backend error message
        error.message ||
        error.toString();
      setMessage(resMessage); // Display general error message
      // Optionally, you could try to map backend validation errors to specific fields
      // if your backend sends them in a structured way.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Your Account</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="error-text">
              {errors.name}
            </p>
          )}
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="error-text">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      {/* Display general success/error message */}
      {message && (
        <p
          className={
            Object.keys(errors).length > 0 ||
            message.toLowerCase().includes("failed") ||
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

export default Register;
