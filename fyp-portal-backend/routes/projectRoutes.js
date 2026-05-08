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
const uploadProject = require("../middleware/projectUploadMiddleware");

// Student Routes
router.get("/my", authMiddleware, roleMiddleware("student"), getMyProject);
router.post("/submit", authMiddleware, roleMiddleware("student"), uploadProject.single("reportFile"), submitFinalProject);
router.put("/submit-source", authMiddleware, roleMiddleware("student"), submitSourceCode);
router.post("/submit-source", authMiddleware, roleMiddleware("student"), submitSourceCode); // Add POST as backup

// Teacher Routes
router.get("/teacher/projects", authMiddleware, roleMiddleware("teacher"), getTeacherProjects);
router.put("/evaluate/:projectId", authMiddleware, roleMiddleware("teacher"), evaluateProject);


module.exports = router;