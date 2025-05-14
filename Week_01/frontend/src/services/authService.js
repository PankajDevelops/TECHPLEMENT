// frontend/src/services/authService.js
import axios from "axios";

// Access the environment variable from Vite
const API_URL = import.meta.env.VITE_API_URL + "/users/";

// Register user
const register = (userData) => {
  return axios.post(API_URL + "register", userData);
};

// Login user
const login = (userData) => {
  return axios.post(API_URL + "login", userData).then((response) => {
    if (response.data.token) {
      // Store user object (which includes user details and token)
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  });
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Get current user details (including token) from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Get user profile data from backend
const getUserProfile = () => {
  const user = getCurrentUser();
  if (user && user.token) {
    return axios.get(API_URL + "profile", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }
  return Promise.reject(new Error("No token found")); // Or handle appropriately
};

// Update user profile data
const updateUserProfile = (userData) => {
  const user = getCurrentUser();
  if (user && user.token) {
    return axios.put(API_URL + "profile", userData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }
  return Promise.reject(new Error("No token found"));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
};

export default authService;
