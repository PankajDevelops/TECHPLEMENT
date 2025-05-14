const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); // Auth middleware

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile); // Protected route
router.put("/profile", protect, updateUserProfile); // Protected route

module.exports = router;
