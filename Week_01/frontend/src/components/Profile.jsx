// frontend/src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // Shared form styles

const Profile = () => {
  const [profileData, setProfileData] = useState(null); // Stores the fetched profile data
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Email might not be editable or require special handling
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For profile fetch
  const [isUpdating, setIsUpdating] = useState(false); // For profile update

  const navigate = useNavigate();

  // Fetch profile data when component mounts or user changes
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await authService.getUserProfile(); // authService handles token
        setProfileData(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setBio(response.data.bio || "");
        setMessage(""); // Clear any previous messages
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile. Please log in again.");
        // Consider logging out the user if token is invalid or expired
        // authService.logout();
        // navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    const user = authService.getCurrentUser();
    if (user && user.token) {
      fetchProfile();
    } else {
      navigate("/login", { replace: true }); // Redirect if not logged in
    }
  }, [navigate]); // Rerun if navigate function changes (should be stable)

  // Client-side validation for profile update
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    // Basic email validation if email is editable
    if (editMode && !email.trim()) {
      // Assuming email is part of form
      newErrors.email = "Email is required";
    } else if (editMode && email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    const updatedData = { name, bio };
    // Only include email if it's intended to be updatable and has changed
    if (email !== profileData.email) {
      updatedData.email = email;
    }

    try {
      const response = await authService.updateUserProfile(updatedData);
      setProfileData(response.data.user); // Update local state with new user data
      setName(response.data.user.name);
      setEmail(response.data.user.email);
      setBio(response.data.user.bio || "");

      // Update user in localStorage to keep it consistent
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUserForStorage = {
          ...currentUser,
          user: response.data.user,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserForStorage));
      }

      setMessage(response.data.message || "Profile updated successfully!");
      setEditMode(false); // Exit edit mode on success
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form fields to original profile data
    if (profileData) {
      setName(profileData.name);
      setEmail(profileData.email);
      setBio(profileData.bio || "");
    }
    setEditMode(false);
    setMessage("");
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="form-container profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    // This case might be hit if fetching fails and isLoading is false
    return (
      <div className="form-container profile-container">
        <p>{message || "Could not load profile."}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="form-container profile-container">
      <h2>User Profile</h2>
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

      {!editMode ? (
        <div className="profile-view">
          <p>
            <strong>Name:</strong> {profileData.name}
          </p>
          <p>
            <strong>Email:</strong> {profileData.email}
          </p>
          <p>
            <strong>Bio:</strong>{" "}
            {profileData.bio || "No bio set. Click Edit to add one."}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profileData.createdAt).toLocaleDateString()}
          </p>
          <button onClick={() => setEditMode(true)} disabled={isUpdating}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? "true" : "false"}
              // Consider making email read-only or having specific logic for email change
              // readOnly // Example: if email is not meant to be changed here
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
            />
          </div>
          <button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleCancelEdit}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </form>
      )}
      {/* Logout button is now in App.jsx navbar */}
    </div>
  );
};

export default Profile;
