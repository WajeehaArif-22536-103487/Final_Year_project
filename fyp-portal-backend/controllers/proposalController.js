const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const PreApprovedStudent = require("../models/PreApprovedStudent");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Configure multer for file uploads
const multer = require("multer");

// Ensure upload directory exists
const uploadDir = "uploads/proposals";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for proposal files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${cleanName}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"));
  }
};

// Create multer upload instance
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

exports.uploadProposalFile = upload.single("proposalFile");

// Helper function to normalize text for comparison
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+(the|a|an)$/i, '');
};

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);
  if (normalized1 === normalized2) return 1;
  if (!normalized1 || !normalized2) return 0;
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return 0.9;
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
};

// Helper to get clean display name
const getCleanDisplayName = (fileName) => {
  if (!fileName) return "No file";
  const firstDashIndex = fileName.indexOf('-');
  if (firstDashIndex > 0 && !isNaN(parseInt(fileName.substring(0, firstDashIndex)))) {
    return fileName.substring(firstDashIndex + 1);
  }
  return fileName;
};

// Student submits a project proposal
exports.submitProposal = async (req, res) => {
  try {
    const { title, description } = req.body;
    const studentId = req.user.id;
    
    console.log("=== SUBMIT PROPOSAL ===");
    console.log("Student ID:", studentId);
    console.log("Title:", title);
    
    // Validation
    if (!title || !description) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Title and description are required" });
    }
    
    // Check for existing pending or approved proposal for this student
    const existingProposal = await Proposal.findOne({ 
      student: studentId, 
      status: { $in: ["pending", "approved"] } 
    });
    
    if (existingProposal) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "You already have a pending or approved proposal. Cannot submit another." });
    }
    
    // CHECK FOR DUPLICATE TITLES ACROSS ALL PROPOSALS
    const allExistingProposals = await Proposal.find({
      status: { $in: ["pending", "approved"] }
    }).populate("student", "name email registrationNo");
    
    const normalizedNewTitle = normalizeText(title);
    console.log("Normalized title:", normalizedNewTitle);
    
    // Check for exact match (case insensitive)
    const exactMatch = allExistingProposals.find(p => 
      normalizeText(p.title) === normalizedNewTitle
    );
    
    if (exactMatch) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: `The project title "${title}" has already been submitted by student ${exactMatch.student.name} (${exactMatch.student.registrationNo}). Please choose a completely different title.`,
        duplicate: true,
        existingTitle: exactMatch.title,
        existingStudent: exactMatch.student.name
      });
    }
    
    // Check for similar titles (75% or more)
    for (const proposal of allExistingProposals) {
      const similarity = calculateSimilarity(proposal.title, title);
      console.log(`Similarity with "${proposal.title}": ${similarity}`);
      
      if (similarity >= 0.75) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          message: `Your project title is very similar (${Math.round(similarity * 100)}% match) to "${proposal.title}" submitted by ${proposal.student.name} (${proposal.student.registrationNo}). Please use a more distinctive title.`,
          duplicate: true,
          similarity: Math.round(similarity * 100),
          existingTitle: proposal.title,
          existingStudent: proposal.student.name
        });
      }
    }
    
    // Check for rejected proposal to resubmit
    const rejectedProposal = await Proposal.findOne({ 
      student: studentId, 
      status: "rejected" 
    });
    
    let proposal;
    
    if (rejectedProposal) {
      rejectedProposal.title = title.trim();
      rejectedProposal.description = description;
      rejectedProposal.status = "pending";
      rejectedProposal.teacherFeedback = null;
      
      if (req.file) {
        if (rejectedProposal.fileName) {
          const oldFilePath = path.join(__dirname, "..", "uploads", "proposals", rejectedProposal.fileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        rejectedProposal.fileName = req.file.filename;
      }
      
      await rejectedProposal.save();
      proposal = rejectedProposal;
      
      const project = await Project.findOne({ student: studentId });
      if (project) {
        project.title = title.trim();
        project.status = "pending";
        project.customDeadline = null;
        await project.save();
      }
      
    } else {
      const proposalData = {
        title: title.trim(),
        description: description.trim(),
        student: studentId,
        status: "pending"
      };
      
      if (req.file) {
        proposalData.fileName = req.file.filename;
      }
      
      proposal = await Proposal.create(proposalData);
    }
    
    console.log("Proposal submitted successfully:", proposal._id);
    
    res.status(201).json({ 
      message: rejectedProposal ? "Proposal resubmitted successfully!" : "Proposal submitted successfully!", 
      proposal: {
        _id: proposal._id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        fileName: proposal.fileName
      }
    });
    
  } catch (error) {
    console.error("Submit proposal error:", error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ADD THIS FUNCTION - Check if title is available
exports.checkTitleAvailability = async (req, res) => {
  try {
    const { title } = req.query;
    const studentId = req.user.id;
    
    if (!title || title.length < 3) {
      return res.json({ available: true });
    }
    
    const allExistingProposals = await Proposal.find({
      status: { $in: ["pending", "approved"] }
    }).populate("student", "name");
    
    // Check exact match (case insensitive)
    const exactMatch = allExistingProposals.find(p => 
      p.title.trim().toLowerCase() === title.trim().toLowerCase() &&
      p.student._id.toString() !== studentId
    );
    
    if (exactMatch) {
      return res.json({ 
        available: false, 
        message: `"${title}" already taken by ${exactMatch.student.name}` 
      });
    }
    
    // Check similar titles
    for (const proposal of allExistingProposals) {
      if (proposal.student._id.toString() === studentId) continue;
      
      const similarity = calculateSimilarity(proposal.title, title);
      if (similarity >= 0.75) {
        return res.json({ 
          available: false, 
          message: `Similar to "${proposal.title}" by ${proposal.student.name}`,
          similarity: Math.round(similarity * 100)
        });
      }
    }
    
    res.json({ available: true });
  } catch (error) {
    console.error("Check title availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Student gets their own proposal status
exports.getMyProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ student: req.user.id }).populate("supervisor", "name email");
    if (!proposal) return res.status(200).json(null);
    
    const responseProposal = proposal.toObject();
    responseProposal.displayFileName = getCleanDisplayName(proposal.fileName);
    
    res.status(200).json(responseProposal);
  } catch (error) {
    console.error("Get my proposal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Teacher views only proposals from students THEY added (via CSV)
exports.teacherGetAllProposals = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const preApprovedStudents = await PreApprovedStudent.find({ addedBy: teacherId }).select("registrationNo");
    const studentRegNos = preApprovedStudents.map(s => s.registrationNo);
    const students = await User.find({ role: "student", registrationNo: { $in: studentRegNos } }).select("_id");
    const studentIds = students.map(s => s._id);
    const proposals = await Proposal.find({ student: { $in: studentIds } })
      .populate("student", "name email registrationNo")
      .populate("supervisor", "name email")
      .sort({ createdAt: -1 });
    
    const proposalsWithDisplayName = proposals.map(p => {
      const obj = p.toObject();
      obj.displayFileName = getCleanDisplayName(p.fileName);
      return obj;
    });
    
    res.status(200).json(proposalsWithDisplayName);
  } catch (error) {
    console.error("Teacher get proposals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Teacher approves or rejects a proposal
exports.reviewProposal = async (req, res) => {
  try {
    const { status } = req.body;
    const teacherId = req.user.id;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const proposal = await Proposal.findById(req.params.id).populate("student");
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    
    const preApprovedStudent = await PreApprovedStudent.findOne({ 
      registrationNo: proposal.student.registrationNo, 
      addedBy: teacherId 
    });
    
    if (!preApprovedStudent) {
      return res.status(403).json({ message: "You are not authorized to review this proposal" });
    }
    
    proposal.status = status;
    await proposal.save();
    
    if (status === "approved") {
      let project = await Project.findOne({ proposal: proposal._id });
      if (!project) {
        project = new Project({ 
          proposal: proposal._id, 
          student: proposal.student._id, 
          supervisor: proposal.supervisor, 
          status: "pending",
          title: proposal.title
        });
        await project.save();
      }
    }
    
    const responseProposal = proposal.toObject();
    responseProposal.displayFileName = getCleanDisplayName(proposal.fileName);
    
    res.status(200).json({ message: `Proposal ${status} successfully`, proposal: responseProposal });
  } catch (error) {
    console.error("Review proposal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};