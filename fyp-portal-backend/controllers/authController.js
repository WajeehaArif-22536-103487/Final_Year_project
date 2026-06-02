const User = require("../models/User.js");
const PreApprovedStudent = require("../models/PreApprovedStudent.js");
const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require("../config/email");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Step 1 - Verify Pre-Approval
exports.verifyPreApproval = async (req, res) => {
  try {
    const { registrationNo, cnic } = req.body;
    const studentRecord = await PreApprovedStudent.findOne({
      registrationNo: registrationNo.trim(),
      cnic: cnic.trim(),
      isRegistered: false,
    });
    if (!studentRecord) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid Registration No or CNIC, or account already activated.",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Verification successful." });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// Step 2 - Final Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { registrationNo, cnic, email, password } = req.body;
    if (!registrationNo || !cnic || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const studentRecord = await PreApprovedStudent.findOne({
      registrationNo: registrationNo.trim(),
      cnic: cnic.trim(),
      isRegistered: false,
    });
    if (!studentRecord) {
      return res.status(400).json({
        message:
          "Details don't match our records or account is already active.",
      });
    }
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This email is already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name: studentRecord.name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "student",
      registrationNo: studentRecord.registrationNo,
      status: "active",
      addedBy: studentRecord.addedBy,
    });
    await user.save();
    studentRecord.isRegistered = true;
    await studentRecord.save();
    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("CRITICAL REGISTRATION ERROR:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Registration number or Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account suspended" });
    }
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        status: user.status,
        profilePicture: user.profilePicture || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let additionalData = {};

    // Add teacher-specific stats
    if (user.role === "teacher") {
      const totalAssignedStudents = await Proposal.countDocuments({
        supervisor: user._id,
        status: "approved",
      });

      const activeProjects = await Project.countDocuments({
        supervisor: user._id,
        status: { $in: ["pending", "in-progress", "submitted"] },
      });

      const recentProposals = await Proposal.find({ supervisor: user._id })
        .sort({ updatedAt: -1 })
        .limit(3);

      const recentActivities = recentProposals.map((p) => ({
        title: "Proposal Reviewed",
        description: p.title,
        status: p.status === "approved" ? "Approved" : "Rejected",
      }));

      additionalData = {
        totalAssignedStudents,
        activeProjects,
        recentActivities,
      };
    }

    //  For student-specific stats
    if (user.role === "student") {
      const proposal = await Proposal.findOne({ student: user._id });
      const project = await Project.findOne({ student: user._id });
      const evaluatedProject = await Project.findOne({
        student: user._id,
        status: "evaluated",
      });

      let supervisor = null;
      if (proposal?.supervisor) {
        supervisor = await User.findById(proposal.supervisor).select(
          "name email",
        );
      }

      additionalData = {
        hasProposal: !!proposal,
        proposalStatus: proposal?.status || null,
        proposalTitle: proposal?.title || null,
        hasProject: !!project,
        projectStatus: project?.status || null,
        projectGrade: project?.grade || null,
        isEvaluated: !!evaluatedProject,
        supervisor: supervisor,
      };
    }

    // Send response with combined data
    res.json({ ...user.toObject(), ...additionalData });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      designation,
      bio,
      program,
      session,
      semester,
    } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phone,
        department,
        designation,
        bio,
        program,
        session,
        semester,
      },
      { new: true },
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
  
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    // Make sure this uses the FULL filename
    const profilePicture = `/uploads/profiles/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true },
    ).select("-password");

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: profilePicture,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password - Send reset email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email address" });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 3600000; // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
    
    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.name);
    
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      return res.status(500).json({ 
        message: "Failed to send reset email. Please try again later." 
      });
    }
    
    res.json({ 
      message: "Password reset link has been sent to your email address" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password - Set new password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Send confirmation email
    await sendPasswordResetSuccessEmail(user.email, user.name);
    
    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};