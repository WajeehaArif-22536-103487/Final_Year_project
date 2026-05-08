const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const PreApprovedStudent = require("../models/PreApprovedStudent");
const User = require("../models/User");
const Deadline = require("../models/Deadline");
const fs = require("fs");
const csv = require("csv-parser");

// Upload CSV for pre-approved students
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }
    const students = [];
    const errors = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (!row.name || !row.registrationNo || !row.cnic) {
          errors.push(`Missing data in row: ${JSON.stringify(row)}`);
          return;
        }
        students.push({
          name: row.name.trim(),
          registrationNo: row.registrationNo.trim(),
          cnic: row.cnic.trim(),
          isRegistered: false,
          addedBy: req.user.id
        });
      })
      .on("end", async () => {
        try {
          if (students.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "No valid data found in CSV" });
          }
          const operations = students.map((student) => ({
            updateOne: {
              filter: { registrationNo: student.registrationNo },
              update: { $set: { name: student.name, cnic: student.cnic, addedBy: student.addedBy }, $setOnInsert: { isRegistered: false } },
              upsert: true,
            },
          }));
          await PreApprovedStudent.bulkWrite(operations);
          fs.unlinkSync(req.file.path);
          res.json({ message: `Successfully uploaded ${students.length} students`, count: students.length, students: students, errors: errors.length > 0 ? errors : null });
        } catch (error) {
          if (req.file) fs.unlinkSync(req.file.path);
          res.status(500).json({ message: error.message });
        }
      });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

// Get all pre-approved students
exports.getPreApprovedStudents = async (req, res) => {
  try {
    const students = await PreApprovedStudent.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle proposal (approve/reject)
exports.handleProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    proposal.status = action === "approve" ? "approved" : "rejected";
    await proposal.save();
    if (action === "approve") {
      let project = await Project.findOne({ proposal: proposal._id });
      if (!project) {
        project = new Project({ proposal: proposal._id, student: proposal.student, supervisor: proposal.supervisor || req.user.id, status: "pending" });
        await project.save();
      }
    }
    res.json({ message: `Proposal ${proposal.status} successfully`, proposal });
  } catch (error) {
    console.error("Handle proposal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Evaluate project with letter grade
exports.evaluateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { grade, obtainedMarks, totalMarks, feedback } = req.body;
    
    const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];
    if (!validGrades.includes(grade)) {
      return res.status(400).json({ message: "Invalid grade. Use A+ to F" });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (project.supervisor?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the supervisor of this project" });
    }
    
    project.grade = grade;
    project.obtainedMarks = obtainedMarks;
    project.totalMarks = totalMarks || 100;
    project.teacherFeedback = feedback;
    project.status = "evaluated";
    await project.save();
    
    console.log("Project evaluated successfully");
    
    res.json({ message: "Project evaluated successfully", project });
  } catch (error) {
    console.error("Evaluate project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Set deadline for project
exports.setDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.supervisor?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    project.customDeadline = deadline;
    await project.save();
    res.json({ message: "Deadline updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's assigned projects (ALL where teacher is supervisor)
exports.getMyAssignedProjects = async (req, res) => {
  try {
    let projects = await Project.find({ supervisor: req.user.id })
      .populate("student", "name email registrationNo")
      .populate("proposal", "title description status");
    
    const formattedProjects = projects.map(project => {
      const proposalData = project.proposal || {};
      return {
        _id: project._id,
        title: proposalData.title || "Untitled Project",
        description: proposalData.description || "No description provided",
        status: project.status || "pending",
        grade: project.grade || null,
        teacherFeedback: project.teacherFeedback || null,
        sourceLink: project.sourceLink || null,
        filePath: project.filePath || null,
        student: {
          _id: project.student?._id || project.student,
          name: project.student?.name || "Unknown Student",
          email: project.student?.email || "N/A",
          registrationNo: project.student?.registrationNo || "Not Available"
        },
        proposal: { _id: proposalData._id, title: proposalData.title, description: proposalData.description },
        createdAt: project.createdAt,
        customDeadline: project.customDeadline
      };
    });
    res.json(formattedProjects);
  } catch (error) {
    console.error("Get assigned projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get teacher's projects
exports.getTeacherProjects = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const projects = await Project.find({ supervisor: teacherId })
      .populate("student", "name email registrationNo")
      .populate("proposal", "title description");
    res.json(projects);
  } catch (error) {
    console.error("Get teacher projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get assigned proposals for teacher
exports.getAssignedProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ supervisor: req.user.id, status: "approved" })
      .populate("student", "name email registrationNo")
      .populate("supervisor", "name email")
      .sort({ createdAt: -1 });
    
    const formattedProposals = proposals.map(proposal => ({
      _id: proposal._id,
      title: proposal.title,
      description: proposal.description,
      status: proposal.status,
      student: {
        _id: proposal.student?._id,
        name: proposal.student?.name || "Unknown",
        email: proposal.student?.email || "N/A",
        registrationNo: proposal.student?.registrationNo || "Not Available"
      },
      supervisor: proposal.supervisor,
      createdAt: proposal.createdAt
    }));
    res.json(formattedProposals);
  } catch (error) {
    console.error("Get assigned proposals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get rejected proposals count
exports.getRejectedProposalsCount = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const preApprovedStudents = await PreApprovedStudent.find({ addedBy: teacherId }).select("registrationNo");
    const studentRegNos = preApprovedStudents.map(s => s.registrationNo);
    const students = await User.find({ role: "student", registrationNo: { $in: studentRegNos } }).select("_id");
    const studentIds = students.map(s => s._id);
    
    const count = await Proposal.countDocuments({ 
      student: { $in: studentIds }, 
      status: "rejected" 
    });
    
    res.json({ count });
  } catch (error) {
    console.error("Get rejected proposals count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};