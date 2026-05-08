const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileUploadMiddleware = require("../middleware/profileUploadMiddleware");

// Import controller functions
const {
  verifyPreApproval,
  registerStudent,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword
} = require("../controllers/authController");

// Public routes
router.post("/verify-preapproval", verifyPreApproval);
router.post("/register-student", registerStudent);
router.post("/login", loginUser);

// Protected profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/upload-picture", authMiddleware, profileUploadMiddleware.single("profilePicture"), uploadProfilePicture);
router.post("/profile/change-password", authMiddleware, changePassword);


module.exports = router;