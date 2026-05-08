const Project = require("../models/Project");

exports.getPublicProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: { $in: ["evaluated", "graded"] } })
      .populate("student", "name email registrationNo")
      .populate("supervisor", "name email")
      .populate("proposal", "title description");
    const publicProjects = projects.map(project => ({
      _id: project._id,
      title: project.proposal?.title || "Untitled",
      description: project.proposal?.description || "",
      studentName: project.student?.name || "Unknown",
      year: project.createdAt?.getFullYear() || new Date().getFullYear(),
      githubLink: project.sourceLink,
      grade: project.grade
    }));
    res.json(publicProjects);
  } catch (error) {
    console.error("Public projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};