const express = require("express");
const router = express.Router();
const {
  submitFinalProject,
  submitSourceCode,
  getMyProject,
  getTeacherProjects,
  evaluateProject
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { uploadProjectFiles } = require("../middleware/projectUploadMiddleware");

// Student Routes
router.get("/my", authMiddleware, roleMiddleware("student"), getMyProject);

// UPDATED: Submit final project with multiple files (report + video)
router.post(
  "/submit", 
  authMiddleware, 
  roleMiddleware("student"), 
  uploadProjectFiles,  
  submitFinalProject
);

router.put("/submit-source", authMiddleware, roleMiddleware("student"), submitSourceCode);
router.post("/submit-source", authMiddleware, roleMiddleware("student"), submitSourceCode);

// Teacher Routes
router.get("/teacher/projects", authMiddleware, roleMiddleware("teacher"), getTeacherProjects);
router.put("/evaluate/:projectId", authMiddleware, roleMiddleware("teacher"), evaluateProject);

module.exports = router;