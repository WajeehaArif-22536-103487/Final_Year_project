const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const User = require("../models/User");
const Deadline = require("../models/Deadline");

// Student submits final project source code/link, demo video, and report
exports.submitSourceCode = async (req, res) => {
  try {
    const { sourceLink, demoVideoLink } = req.body;
    const studentId = req.user.id;

    // Find the student's project
    const project = await Project.findOne({ student: studentId });

    if (!project) {
      return res.status(404).json({
        message: "Project not found. Make sure your proposal is approved.",
      });
    }

    // Update project with new fields
    if (sourceLink) project.sourceLink = sourceLink;
    if (demoVideoLink) project.demoVideoLink = demoVideoLink;
    
    project.status = "submitted";
    await project.save();

    console.log("Project updated successfully:", project._id);

    res.json({
      message: "Final project submitted successfully",
      project: project,
    });
  } catch (error) {
    console.error("Submit source code error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Student submits final project with multiple files (PDF report + video)
exports.submitFinalProject = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { sourceLink, demoVideoLink } = req.body;

    // Find the student's project
    const project = await Project.findOne({ student: studentId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.reportFile) {
        project.reportFile = `/uploads/reports/${req.files.reportFile[0].filename}`;
      }
      if (req.files.demoVideo) {
        project.demoVideoFile = `/uploads/videos/${req.files.demoVideo[0].filename}`;
      }
    }

    // Handle links
    if (sourceLink) project.sourceLink = sourceLink;
    if (demoVideoLink) project.demoVideoLink = demoVideoLink;

    project.status = "submitted";
    await project.save();

    res.json({
      message: "Final project submitted successfully",
      project: project,
    });
  } catch (error) {
    console.error("Submit final project error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get student's own project
exports.getMyProject = async (req, res) => {
  try {
    const studentId = req.user.id;
    const project = await Project.findOne({ student: studentId })
      .populate("proposal", "title description")
      .populate("supervisor", "name email");

    if (!project) {
      return res.status(200).json(null);
    }

    // Ensure all fields are included (ADDED demoVideoLink, demoVideoFile, reportFile)
    const responseData = {
      _id: project._id,
      title: project.title,
      sourceLink: project.sourceLink,
      demoVideoLink: project.demoVideoLink,        // NEW
      demoVideoFile: project.demoVideoFile,        // NEW
      reportFile: project.reportFile,              // NEW
      grade: project.grade,
      obtainedMarks: project.obtainedMarks || project.marks,
      marks: project.marks,
      totalMarks: project.totalMarks || 100,
      teacherFeedback: project.teacherFeedback,
      status: project.status,
      customDeadline: project.customDeadline,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
    res.json(responseData);
  } catch (error) {
    console.error("Get my project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all projects assigned to the teacher
exports.getTeacherProjects = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const projects = await Project.find({ supervisor: teacherId })
      .populate("student", "name email registrationNo")
      .populate("proposal", "title description")
      .sort({ createdAt: -1 });
    
    // Format response to include new fields
    const formattedProjects = projects.map(project => ({
      _id: project._id,
      title: project.proposal?.title,
      description: project.proposal?.description,
      sourceLink: project.sourceLink,
      demoVideoLink: project.demoVideoLink,   
      demoVideoFile: project.demoVideoFile,    
      reportFile: project.reportFile,           
      grade: project.grade,
      teacherFeedback: project.teacherFeedback,
      status: project.status,
      student: project.student,
      proposal: project.proposal
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error("Get teacher projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Teacher: Evaluate a project with grade and feedback
exports.evaluateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { grade, obtainedMarks, marks, totalMarks, feedback } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check authorization
    if (project.supervisor?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to evaluate this project" });
    }
    
    // Update all fields
    const finalObtainedMarks = obtainedMarks || marks;
    
    project.grade = grade;
    project.obtainedMarks = finalObtainedMarks;
    project.marks = finalObtainedMarks;
    project.totalMarks = totalMarks || 100;
    project.teacherFeedback = feedback || "";
    project.status = "evaluated";
    
    await project.save();
    
    res.json({ 
      message: "Project evaluated successfully", 
      project: {
        _id: project._id,
        grade: project.grade,
        obtainedMarks: project.obtainedMarks,
        totalMarks: project.totalMarks,
        teacherFeedback: project.teacherFeedback,
        status: project.status
      }
    });
  } catch (error) {
    console.error("Evaluate project error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};