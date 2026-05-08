const express = require("express");
const router = express.Router();

const {
  uploadCSV,
  getPreApprovedStudents,
  handleProposal,
  evaluateProject,
  setDeadline,
  getMyAssignedProjects,
  getAssignedProposals,
  getRejectedProposalsCount,
  getTeacherProjects  // Make sure this is added to the import
} = require("../controllers/teacherController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// CSV Upload Routes
router.post(
  "/upload-csv",
  authMiddleware,
  roleMiddleware("teacher"),
  upload.single("file"),
  uploadCSV
);

router.get(
  "/preapproved",
  authMiddleware,
  roleMiddleware("teacher"),
  getPreApprovedStudents
);

// Proposal Routes
router.put(
  "/proposal/:proposalId",
  authMiddleware,
  roleMiddleware("teacher"),
  handleProposal
);

// Project Evaluation Routes
router.put(
  "/project/:projectId/evaluate",
  authMiddleware,
  roleMiddleware("teacher"),
  evaluateProject
);

router.put(
  "/project/:projectId/deadline",
  authMiddleware,
  roleMiddleware("teacher"),
  setDeadline
);

// Get assigned projects
router.get(
  "/projects",
  authMiddleware,
  roleMiddleware("teacher"),
  getTeacherProjects
);

// Get assigned proposals
router.get(
  "/assigned-proposals",
  authMiddleware,
  roleMiddleware("teacher"),
  getAssignedProposals
);

router.get(
  "/rejected-proposals-count",
  authMiddleware,
  roleMiddleware("teacher"),
  getRejectedProposalsCount
);

// Get my assigned projects (alternative route)
router.get(
  "/my-projects",
  authMiddleware,
  roleMiddleware("teacher"),
  getMyAssignedProjects
);


module.exports = router;