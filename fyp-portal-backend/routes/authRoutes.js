const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileUploadMiddleware = require("../middleware/profileUploadMiddleware");

// Import controller functions - Make sure ALL are imported
const {
  verifyPreApproval,
  registerStudent,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  forgotPassword,      
  resetPassword       
} = require("../controllers/authController");

// Public routes
router.post("/verify-preapproval", verifyPreApproval);
router.post("/register-student", registerStudent);
router.post("/login", loginUser);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);    // ← ADD THIS ROUTE
router.post("/reset-password", resetPassword);      // ← ADD THIS ROUTE

// Protected profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/upload-picture", authMiddleware, profileUploadMiddleware.single("profilePicture"), uploadProfilePicture);
router.post("/profile/change-password", authMiddleware, changePassword);

module.exports = router;