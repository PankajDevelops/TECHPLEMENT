const User = require("../models/User");
const jwt = require("jsonwebtoken");
// Make sure dotenv is configured in server.js or here if needed for JWT_SECRET
// require('dotenv').config(); // Typically done once in server.js

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expiration
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Basic server-side validation (can be enhanced with libraries like express-validator)
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter all fields (name, email, password)" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    // Email format validation (Mongoose schema also does this, but good for early check)
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Check if user already exists by email
    let user = await User.findOne({ email: email.toLowerCase() }); // Search with lowercase email
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user instance (password will be hashed by pre-save hook in User model)
    user = new User({
      name,
      email: email.toLowerCase(), // Store email in lowercase
      password,
    });

    await user.save(); // This is where the E11000 might occur if DB schema mismatches

    // Get the saved user without the password for the response
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse, // Send back user details (without password)
      token: generateToken(user._id), // Send token for immediate login
    });
  } catch (err) {
    console.error("Registration Error:", err); // Log the full error

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    // MongoDB duplicate key error (e.g., for email if somehow it wasn't caught above)
    if (err.code === 11000) {
      // Check if the error is for the email field
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ message: "Email already exists." });
      }
      // If it's another duplicate key error (like the username one from a rogue index)
      return res
        .status(400)
        .json({
          message:
            "A user with some of these details already exists. Please check your input.",
        });
    }
    // General server error
    res
      .status(500)
      .json({
        message: "Server error during registration. Please try again later.",
      });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter both email and password" });
    }

    // Find user by email (case-insensitive for login convenience, stored as lowercase)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    ); // Explicitly select password

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" }); // Generic message
    }

    // Compare entered password with stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" }); // Generic message
    }

    // If credentials are valid, return user info and token
    const userResponse = await User.findById(user._id).select("-password");

    res.json({
      message: "Login successful",
      user: userResponse,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({ message: "Server error during login. Please try again later." });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (requires token authentication via authMiddleware)
exports.getUserProfile = async (req, res) => {
  // req.user is set by the authMiddleware.protect
  try {
    // The user object attached by `protect` middleware might already be what you need.
    // If not, or if you want the absolute latest, you can re-fetch.
    // const user = await User.findById(req.user.id).select('-password');
    // if (!user) {
    //     return res.status(404).json({ message: 'User not found' });
    // }
    // res.json(user);

    // Assuming req.user is populated correctly by authMiddleware and is sufficient
    if (!req.user) {
      // Should not happen if protect middleware is working
      return res
        .status(404)
        .json({ message: "User not found or token issue." });
    }
    res.json(req.user); // req.user should already have password deselected by authMiddleware
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  // Only allow updating specific fields
  const { name, bio, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided in the request body
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio; // Allow setting bio to empty string

    // Handle email change carefully
    if (email && email.toLowerCase() !== user.email) {
      // Check if the new email is already taken by another user
      const existingUserWithNewEmail = await User.findOne({
        email: email.toLowerCase(),
      });
      if (
        existingUserWithNewEmail &&
        existingUserWithNewEmail._id.toString() !== user._id.toString()
      ) {
        return res
          .status(400)
          .json({
            message: "This email is already in use by another account.",
          });
      }
      user.email = email.toLowerCase();
    }
    // Note: Password changes should typically be handled via a separate, dedicated endpoint
    // that requires the current password for security.

    const updatedUser = await user.save();
    const userResponse = await User.findById(updatedUser._id).select(
      "-password"
    );

    res.json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res
        .status(400)
        .json({ message: "This email is already in use by another account." });
    }
    res.status(500).json({ message: "Server error updating profile." });
  }
};
