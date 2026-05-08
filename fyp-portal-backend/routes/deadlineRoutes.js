const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  setProposalDeadline,
  setProjectDeadline,
  getMyDeadlines,
  removeProposalDeadline,
  removeProjectDeadline,
  removeRejectedDeadline,
  setRejectedStudentsDeadline,
  checkProposalDeadline,    
  checkProjectDeadline, 
  checkRejectedProposalDeadline,     
  getProjectDeadline ,
  getTeacherProjectDeadline          
} = require("../controllers/deadlineController");

// POST routes
router.post("/proposal-deadline", authMiddleware, setProposalDeadline);
router.post("/project-deadline", authMiddleware, setProjectDeadline);
router.post("/rejected-students-deadline", authMiddleware, setRejectedStudentsDeadline);

// GET routes
router.get("/my-deadlines", authMiddleware, getMyDeadlines);
router.get("/check-proposal-deadline", authMiddleware, checkProposalDeadline);
router.get("/check-project-deadline/:projectId", authMiddleware, checkProjectDeadline);
router.get("/project-deadline/:projectId", authMiddleware, getProjectDeadline);
router.get("/check-rejected-proposal-deadline", authMiddleware, checkRejectedProposalDeadline);
router.get("/teacher-project-deadline", authMiddleware, getTeacherProjectDeadline);

// DELETE routes
router.delete("/proposal-deadline", authMiddleware, removeProposalDeadline);
router.delete("/project-deadline", authMiddleware, removeProjectDeadline);
router.delete("/rejected-deadline", authMiddleware, removeRejectedDeadline);


module.exports = router;