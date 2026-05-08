const User = require("../models/User");
const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const bcrypt = require("bcryptjs");
const PreApprovedStudent = require("../models/PreApprovedStudent");

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Suspend User
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = "suspended";
    await user.save();
    res.json({ message: "User suspended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Activate User (Unsuspend)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = "active";
    await user.save();
    res.json({ message: "User activated successfully" });
  } catch (error) {
    console.error("Activate user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new User({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      status: "active"
    });
    await newTeacher.save();
    res.status(201).json({ message: "Teacher account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Approve Teacher
exports.approveTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    teacher.status = "active";
    await teacher.save();
    res.json({ message: "Teacher approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalProposals = await Proposal.countDocuments();
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const approvedProjects = await Project.countDocuments({ status: "evaluated" });
    res.json({ totalStudents, totalTeachers, totalProposals, approvedProjects });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// View Approved Proposals
exports.adminGetAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: "approved" })
      .populate("student", "name email")
      .populate("supervisor", "name email");
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Assign Supervisor
exports.assignSupervisor = async (req, res) => {
  try {
    const { proposalId, supervisorId } = req.body;
    if (!proposalId || !supervisorId) {
      return res.status(400).json({ message: "Proposal ID and Supervisor ID are required" });
    }
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    if (proposal.status !== "approved") {
      return res.status(400).json({ message: "Supervisor can only be assigned to approved proposals" });
    }
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "teacher") {
      return res.status(404).json({ message: "Supervisor not found or user is not a teacher" });
    }
    proposal.supervisor = supervisor._id;
    await proposal.save();
    let project = await Project.findOne({ proposal: proposal._id });
    if (!project) {
      project = new Project({
        proposal: proposal._id,
        student: proposal.student,
        supervisor: supervisor._id,
        status: "pending",
        title: proposal.title
      });
      await project.save();
    } else {
      project.supervisor = supervisor._id;
      project.status = "pending";
      await project.save();
    }
    res.status(200).json({
      message: "Supervisor assigned successfully",
      proposal: await proposal.populate("supervisor", "name email"),
      project: project
    });
  } catch (error) {
    console.error("Assign Supervisor Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// View All Approved Projects
exports.getAllApprovedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "evaluated" })
      .populate("student", "name email")
      .populate("supervisor", "name email")
      .populate("proposal", "title description");
    
    // Format projects to include title from proposal
    const formattedProjects = projects.map(project => ({
      _id: project._id,
      title: project.title || project.proposal?.title || "Untitled Project",
      proposalTitle: project.proposal?.title,
      student: project.student,
      supervisor: project.supervisor,
      grade: project.grade,
      sourceLink: project.sourceLink,
      status: project.status,
      createdAt: project.createdAt
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error("Get approved projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};