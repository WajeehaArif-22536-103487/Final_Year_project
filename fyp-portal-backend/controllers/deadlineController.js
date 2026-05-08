const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const PreApprovedStudent = require("../models/PreApprovedStudent");
const User = require("../models/User");
const Deadline = require("../models/Deadline");

// Teacher: Set proposal deadline
exports.setProposalDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;
    const teacherId = req.user.id;

    if (!deadline) {
      return res.status(400).json({ message: "Deadline date is required" });
    }

    // Save to database
    let deadlineDoc = await Deadline.findOne({ teacher: teacherId });
    if (!deadlineDoc) {
      deadlineDoc = new Deadline({ teacher: teacherId });
    }
    deadlineDoc.proposalDeadline = deadline;
    await deadlineDoc.save();

    res.json({
      message: "Proposal deadline set successfully",
      deadline: deadline,
    });
  } catch (error) {
    console.error("Set proposal deadline error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Teacher: Set project deadline
exports.setProjectDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;
    const teacherId = req.user.id;

    if (!deadline) {
      return res.status(400).json({ message: "Deadline date is required" });
    }

    // Save to database
    let deadlineDoc = await Deadline.findOne({ teacher: teacherId });
    if (!deadlineDoc) {
      deadlineDoc = new Deadline({ teacher: teacherId });
    }
    deadlineDoc.projectDeadline = deadline;
    await deadlineDoc.save();

    // Update all projects
    await Project.updateMany(
      { supervisor: teacherId },
      { customDeadline: deadline },
    );

    res.json({
      message: "Project deadline set successfully",
      deadline: deadline,
    });
  } catch (error) {
    console.error("Set project deadline error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Teacher: Get their deadlines
exports.getMyDeadlines = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const deadlineDoc = await Deadline.findOne({ teacher: teacherId });

    const preApprovedStudents = await PreApprovedStudent.find({
      addedBy: teacherId,
    });
    const assignedProjects = await Project.find({ supervisor: teacherId });

    const studentRegNos = preApprovedStudents.map((s) => s.registrationNo);
    const students = await User.find({
      role: "student",
      registrationNo: { $in: studentRegNos },
    }).select("_id");
    const studentIds = students.map((s) => s._id);

    const rejectedCount = await Proposal.countDocuments({
      student: { $in: studentIds },
      status: "rejected",
    });

    res.json({
      proposalDeadline: deadlineDoc?.proposalDeadline || null,
      projectDeadline: deadlineDoc?.projectDeadline || null,
      rejectedDeadline: deadlineDoc?.rejectedDeadline || null, // ADD THIS
      studentCount: preApprovedStudents.length,
      assignedStudentCount: assignedProjects.length,
      rejectedCount: rejectedCount,
    });
  } catch (error) {
    console.error("Get my deadlines error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove proposal deadline
exports.removeProposalDeadline = async (req, res) => {
  try {
    const teacherId = req.user.id;
    await Deadline.findOneAndUpdate(
      { teacher: teacherId },
      { proposalDeadline: null },
    );
    res.json({ message: "Proposal deadline removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Remove project deadline
exports.removeProjectDeadline = async (req, res) => {
  try {
    const teacherId = req.user.id;
    await Deadline.findOneAndUpdate(
      { teacher: teacherId },
      { projectDeadline: null },
    );
    await Project.updateMany(
      { supervisor: teacherId },
      { customDeadline: null },
    );
    res.json({ message: "Project deadline removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set deadline for rejected students
exports.setRejectedStudentsDeadline = async (req, res) => {
  try {
    const { newDeadline } = req.body;
    const teacherId = req.user.id;

    if (!newDeadline) {
      return res.status(400).json({ message: "Deadline date is required" });
    }

    // First, save the rejected deadline to the Deadline model
    let deadlineDoc = await Deadline.findOne({ teacher: teacherId });
    if (!deadlineDoc) {
      deadlineDoc = new Deadline({ teacher: teacherId });
    }
    deadlineDoc.rejectedDeadline = newDeadline; // Add this field to your Deadline model
    await deadlineDoc.save();

    // Get all students added by this teacher
    const preApprovedStudents = await PreApprovedStudent.find({
      addedBy: teacherId,
    }).select("registrationNo");
    const studentRegNos = preApprovedStudents.map((s) => s.registrationNo);
    const students = await User.find({
      role: "student",
      registrationNo: { $in: studentRegNos },
    }).select("_id");
    const studentIds = students.map((s) => s._id);

    // Find all rejected proposals for these students
    const rejectedProposals = await Proposal.find({
      student: { $in: studentIds },
      status: "rejected",
    });

    let updatedCount = 0;
    for (const proposal of rejectedProposals) {
      // Find or create project for this student
      let project = await Project.findOne({
        student: proposal.student,
        supervisor: teacherId,
      });

      if (project) {
        project.customDeadline = newDeadline;
        project.status = "pending";
        await project.save();
        updatedCount++;
      } else {
        // Create a new project for the rejected proposal
        const newProject = new Project({
          proposal: proposal._id,
          student: proposal.student,
          supervisor: teacherId,
          title: proposal.title,
          customDeadline: newDeadline,
          status: "pending",
        });
        await newProject.save();
        updatedCount++;
      }
    }

    res.json({
      message: `Deadline set for ${updatedCount} rejected students`,
      count: updatedCount,
    });
  } catch (error) {
    console.error("Set rejected students deadline error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Student: Check proposal deadline
exports.checkProposalDeadline = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (!student || !student.registrationNo) {
      return res.json({
        canSubmit: true,
        deadline: null,
        isPassed: false,
        message: "No teacher assigned yet",
      });
    }

    const preApproved = await PreApprovedStudent.findOne({
      registrationNo: student.registrationNo,
    });

    if (!preApproved || !preApproved.addedBy) {
      return res.json({
        canSubmit: true,
        deadline: null,
        isPassed: false,
        message: "No teacher assigned yet",
      });
    }

    const deadlineDoc = await Deadline.findOne({
      teacher: preApproved.addedBy,
    });
    const teacherDeadline = deadlineDoc?.proposalDeadline;

    if (!teacherDeadline) {
      return res.json({
        canSubmit: true,
        deadline: null,
        isPassed: false,
        message: "Teacher has not set a proposal deadline yet",
      });
    }

    const now = new Date();
    const deadlineDate = new Date(teacherDeadline);
    const isPassed = deadlineDate < now;

    res.json({
      canSubmit: !isPassed,
      deadline: teacherDeadline,
      isPassed: isPassed,
      message: isPassed
        ? "Proposal deadline has passed"
        : "You can submit your proposal",
    });
  } catch (error) {
    console.error("Check proposal deadline error:", error);
    res.json({
      canSubmit: true,
      deadline: null,
      isPassed: false,
      message: "Unable to verify deadline, you can submit",
    });
  }
};

// Student: Check project deadline
exports.checkProjectDeadline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.json({ canSubmit: true, deadline: null, isPassed: false });
    }

    // Check individual extension first
    if (project.customDeadline) {
      const isPassed = new Date(project.customDeadline) < new Date();
      return res.json({
        canSubmit: !isPassed,
        deadline: project.customDeadline,
        isPassed: isPassed,
        message: isPassed
          ? "Your extended deadline has passed"
          : "You have an extended deadline",
      });
    }

    // Check teacher's global deadline
    const student = await User.findById(studentId);
    const preApproved = await PreApprovedStudent.findOne({
      registrationNo: student.registrationNo,
    });

    if (!preApproved || !preApproved.addedBy) {
      return res.json({ canSubmit: true, deadline: null, isPassed: false });
    }

    const deadlineDoc = await Deadline.findOne({
      teacher: preApproved.addedBy,
    });
    const teacherDeadline = deadlineDoc?.projectDeadline;

    if (!teacherDeadline) {
      return res.json({ canSubmit: true, deadline: null, isPassed: false });
    }

    const isPassed = new Date(teacherDeadline) < new Date();

    res.json({
      canSubmit: !isPassed,
      deadline: teacherDeadline,
      isPassed: isPassed,
      message: isPassed
        ? "Project deadline has passed"
        : "You can submit your project",
    });
  } catch (error) {
    console.error("Check project deadline error:", error);
    res.json({ canSubmit: true, deadline: null, isPassed: false });
  }
};

// Get project deadline for student
exports.getProjectDeadline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findById(projectId).populate("supervisor");

    if (!project) {
      return res.json({ deadline: null });
    }

    // Check if this project belongs to the student
    if (project.student.toString() !== studentId) {
      return res.json({ deadline: null });
    }

    // First check if project has custom deadline (set for rejected students)
    if (project.customDeadline) {
      return res.json({ deadline: project.customDeadline });
    }

    // If no custom deadline, check teacher's (supervisor) global project deadline
    if (project.supervisor) {
      const deadlineDoc = await Deadline.findOne({
        teacher: project.supervisor._id,
      });
      if (deadlineDoc?.projectDeadline) {
        return res.json({ deadline: deadlineDoc.projectDeadline });
      }
    }

    res.json({ deadline: null });
  } catch (error) {
    console.error("Get project deadline error:", error);
    res.json({ deadline: null });
  }
};

// Student: Get teacher's project deadline (for the teacher supervising them)
exports.getTeacherProjectDeadline = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find student's project to get supervisor
    const project = await Project.findOne({ student: studentId }).populate(
      "supervisor",
    );

    if (!project || !project.supervisor) {
      return res.json({ deadline: null, message: "No supervisor assigned" });
    }

    const teacherId = project.supervisor._id;
    const deadlineDoc = await Deadline.findOne({ teacher: teacherId });

    res.json({
      deadline: deadlineDoc?.projectDeadline || null,
      teacherName: project.supervisor.name,
    });
  } catch (error) {
    console.error("Get teacher project deadline error:", error);
    res.json({ deadline: null });
  }
};

// Student: Check rejected proposal deadline (separate from regular proposal deadline)
exports.checkRejectedProposalDeadline = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student info
    const student = await User.findById(studentId);
    if (!student || !student.registrationNo) {
      return res.json({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "No teacher assigned yet",
      });
    }

    // Find which teacher added this student
    const preApproved = await PreApprovedStudent.findOne({
      registrationNo: student.registrationNo,
    });

    if (!preApproved || !preApproved.addedBy) {
      return res.json({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "No teacher assigned yet",
      });
    }

    const teacherId = preApproved.addedBy;

    // Find if student has a rejected proposal and get its custom deadline
    const rejectedProposal = await Proposal.findOne({
      student: studentId,
      status: "rejected",
    });

    if (!rejectedProposal) {
      return res.json({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "No rejected proposal found",
      });
    }

    // Check for custom deadline on the project (set by teacher for rejected students)
    const project = await Project.findOne({
      student: studentId,
      supervisor: teacherId,
    });

    let rejectedDeadline = null;
    if (project && project.customDeadline) {
      rejectedDeadline = project.customDeadline;
    }

    if (!rejectedDeadline) {
      return res.json({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "Teacher has not set a resubmission deadline yet",
      });
    }

    const now = new Date();
    const deadlineDate = new Date(rejectedDeadline);
    const isPassed = deadlineDate < now;

    res.json({
      canSubmit: !isPassed,
      deadline: rejectedDeadline,
      isPassed: isPassed,
      message: isPassed
        ? "Resubmission deadline has passed"
        : "You can resubmit your proposal",
    });
  } catch (error) {
    console.error("Check rejected proposal deadline error:", error);
    res.json({
      canSubmit: false,
      deadline: null,
      isPassed: false,
      message: "Unable to verify deadline",
    });
  }
};

// Remove rejected students deadline
exports.removeRejectedDeadline = async (req, res) => {
  try {
    const teacherId = req.user.id;
    await Deadline.findOneAndUpdate(
      { teacher: teacherId },
      { rejectedDeadline: null },
    );
    res.json({ message: "Rejected students deadline removed successfully" });
  } catch (error) {
    console.error("Remove rejected deadline error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
