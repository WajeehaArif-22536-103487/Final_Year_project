const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  submitProposal,
  getMyProposal,
  teacherGetAllProposals,
  reviewProposal,
  uploadProposalFile ,
  checkTitleAvailability
} = require("../controllers/proposalController");

// Student routes
router.post("/submit", authMiddleware, uploadProposalFile, submitProposal);  
router.get("/my", authMiddleware, getMyProposal);
router.get("/check-title", authMiddleware, checkTitleAvailability);

// Teacher routes
router.get("/all", authMiddleware, teacherGetAllProposals);
router.put("/review/:id", authMiddleware, reviewProposal);

module.exports = router;