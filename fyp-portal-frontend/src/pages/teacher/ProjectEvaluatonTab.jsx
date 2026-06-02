import React, { useState } from "react";
import {
  ExternalLink,
  Github,
  FileText,
  Send,
  User,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  X,
  Award,
  Mail,
  Hash,
  BookOpen,
  PercentCircle,
  Star,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AssignedGroupsList = ({ projects = [], loadProjects, token }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gradingData, setGradingData] = useState({
    marks: "",
    totalMarks: 100,
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Calculate grade based on marks percentage
  const calculateGrade = (marks, totalMarks) => {
    if (!marks || !totalMarks) return "";
    const percentage = (marks / totalMarks) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 75) return "A-";
    if (percentage >= 70) return "B+";
    if (percentage >= 65) return "B";
    if (percentage >= 60) return "B-";
    if (percentage >= 55) return "C+";
    if (percentage >= 50) return "C";
    if (percentage >= 45) return "D";
    return "F";
  };

  const getGradeLabel = (grade) => {
    const grades = {
      "A+": "Excellent",
      A: "Outstanding",
      "A-": "Very Good",
      "B+": "Good",
      B: "Satisfactory",
      "B-": "Average",
      "C+": "Fair",
      C: "Pass",
      D: "Marginal",
      F: "Fail",
    };
    return grades[grade] || "";
  };

  const getPercentage = (marks, totalMarks) => {
    if (!marks || !totalMarks) return 0;
    return ((marks / totalMarks) * 100).toFixed(1);
  };

  const getProjectTitle = (project) => {
    return project.title || project.proposal?.title || "Untitled Project";
  };

  const getProjectDescription = (project) => {
    return (
      project.description ||
      project.proposal?.description ||
      "No description provided."
    );
  };

  const getStudentName = (project) => {
    return project.student?.name || "Unknown Student";
  };

  const getStudentRegNo = (project) => {
    return project.student?.registrationNo || "Not Available";
  };

  const getStudentEmail = (project) => {
    return project.student?.email || "Not Available";
  };

  const getSourceLink = (project) => {
    return project.sourceLink || project.filePath || null;
  };

  const getDemoVideoLink = (project) => {
    return project.demoVideoLink || null;
  };

  const getDemoVideoFile = (project) => {
    return project.demoVideoFile || null;
  };

  const getReportFile = (project) => {
    return project.reportFile || null;
  };

  const getFullFileUrl = (filePath) => {
    if (!filePath) return null;
    // If it's already a full URL, return as is
    if (filePath.startsWith("http")) return filePath;
    // Otherwise, prepend the API base URL
    return `${API_URL.replace("/api", "")}${filePath}`;
  };

  const getMarksColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 45) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSubmitGrade = async () => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    const obtainedMarks = parseFloat(gradingData.marks);
    const totalMarks = parseFloat(gradingData.totalMarks);

    if (isNaN(obtainedMarks)) {
      toast.error("Please enter valid marks");
      return;
    }

    if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
      toast.error(`Marks must be between 0 and ${totalMarks}`);
      return;
    }

    const grade = calculateGrade(obtainedMarks, totalMarks);
    const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(1);

    console.log("Submitting evaluation:", {
      projectId: selectedProject._id,
      obtainedMarks,
      totalMarks,
      grade,
      feedback: gradingData.feedback,
    });

    setIsSubmitting(true);
    try {
      const projectId = selectedProject._id;
      // Use the correct URL from teacherRoutes
      const response = await fetch(
        `${API_URL}/teacher/project/${projectId}/evaluate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            grade: grade,
            obtainedMarks: obtainedMarks,
            totalMarks: totalMarks,
            feedback: gradingData.feedback || "",
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      console.log("Evaluation response:", data);

      toast.success(`Evaluation submitted! Grade: ${grade} (${percentage}%)`);
      setGradingData({ marks: "", totalMarks: 100, feedback: "" });
      setSelectedProject(null);
      setIsMobileMenuOpen(false);
      if (loadProjects) loadProjects();
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error(err.message || "Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setGradingData({
      marks: project.marks?.toString() || "",
      totalMarks: project.totalMarks || 100,
      feedback: project.teacherFeedback || "",
    });
    setIsMobileMenuOpen(false);
  };

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark rounded-full flex items-center justify-center mb-4">
          <FileText size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-500">
          No Projects Assigned
        </h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Projects will appear here once admin assigns students to you
        </p>
        <button
          onClick={() => loadProjects && loadProjects()}
          className="mt-4 px-5 py-2 bg-brand-teal text-white rounded-xl hover:bg-teal-600 transition-all"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Mobile Project Selector Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-brand-muted rounded-xl shadow-sm border dark:border-teal-900/30"
        >
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-brand-teal" />
            <span className="font-semibold dark:text-white">
              {selectedProject
                ? getProjectTitle(selectedProject)
                : "Select a Project"}
            </span>
          </div>
          <ChevronRight
            size={20}
            className={`transform transition-transform ${isMobileMenuOpen ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-200px)]">
        {/* LEFT: Project List - Mobile Drawer / Desktop Sidebar */}
        <AnimatePresence>
          {(isMobileMenuOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`${
                isMobileMenuOpen
                  ? "fixed inset-0 z-50 w-80 bg-white dark:bg-brand-muted shadow-xl rounded-r-2xl"
                  : "relative lg:w-2/5"
              } overflow-y-auto max-h-[calc(100vh-200px)]`}
            >
              {isMobileMenuOpen && (
                <div className="sticky top-0 bg-white dark:bg-brand-muted p-4 border-b dark:border-teal-900/30 flex justify-between items-center">
                  <h2 className="font-bold dark:text-white">
                    Projects ({projects.length})
                  </h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <div
                className={`p-3 space-y-3 ${!isMobileMenuOpen && "hidden lg:block"}`}
              >
                <h2
                  className={`font-black uppercase tracking-tighter mb-4 flex items-center gap-2 ${!isMobileMenuOpen && "hidden lg:flex"}`}
                >
                  <span className="w-1 h-6 bg-brand-teal rounded-full"></span>
                  Your Assigned Projects ({projects.length})
                </h2>

                {projects.map((project, index) => (
                  <motion.div
                    key={project._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleProjectClick(project)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      selectedProject?._id === project._id
                        ? "border-brand-teal bg-brand-teal/5 shadow-md"
                        : "border-transparent hover:bg-slate-50 dark:hover:bg-brand-dark/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <StatusBadge status={project.status || "pending"} />
                      {project.grade && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 rounded-full">
                          {project.grade}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold dark:text-white line-clamp-2 text-base sm:text-lg mb-1">
                      {getProjectTitle(project)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                      <User size={12} />
                      {getStudentName(project)}
                    </p>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      Reg: {getStudentRegNo(project)}
                    </p>
                    {project.marks && (
                      <div className="mt-2 flex items-center gap-2">
                        <Star size={12} className="text-yellow-500" />
                        <span className="text-xs font-semibold">
                          Marks: {project.marks}/{project.totalMarks || 100}
                        </span>
                        <span className="text-xs text-purple-600 font-bold">
                          ({project.grade})
                        </span>
                      </div>
                    )}
                    {getSourceLink(project) && (
                      <a
                        href={getSourceLink(project)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-brand-teal mt-2 hover:underline"
                      >
                        <ExternalLink size={12} /> View Submission
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* RIGHT: Evaluation Panel - Responsive */}
        <div className="flex-1 bg-white dark:bg-brand-muted rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border dark:border-teal-900/20 overflow-y-auto max-h-[calc(100vh-200px)]">
          {!selectedProject ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark rounded-full flex items-center justify-center mb-4">
                <FileText size={40} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-500 text-sm sm:text-base">
                Select a project to evaluate
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Click on any project from the left panel
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="pb-3 border-b">
                <h2 className="text-xl sm:text-2xl font-black dark:text-white break-words mb-2">
                  {getProjectTitle(selectedProject)}
                </h2>
                <StatusBadge status={selectedProject.status || "pending"} />
              </div>

              {/* Student Info - Responsive Grid */}
              <div className="bg-slate-50 dark:bg-brand-dark/50 p-4 sm:p-5 rounded-xl">
                <h3 className="font-bold text-sm mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <User size={16} /> Student Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Full Name</p>
                    <p className="font-medium dark:text-white">
                      {getStudentName(selectedProject)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">
                      Registration Number
                    </p>
                    <p className="font-mono text-sm dark:text-white">
                      {getStudentRegNo(selectedProject)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-xs">Email Address</p>
                    <p className="text-sm dark:text-white break-words">
                      {getStudentEmail(selectedProject)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 dark:bg-brand-dark/50 p-4 sm:p-5 rounded-xl">
                <h3 className="font-bold text-sm mb-2 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <BookOpen size={16} /> Project Description
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {getProjectDescription(selectedProject)}
                </p>
              </div>

              {/* Submission Link */}
              {getSourceLink(selectedProject) ? (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 sm:p-5 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-sm mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Github size={16} /> Student Submission
                  </h3>
                  <a
                    href={getSourceLink(selectedProject)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline break-all flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={14} />
                    {getSourceLink(selectedProject).length > 50
                      ? `${getSourceLink(selectedProject).substring(0, 50)}...`
                      : getSourceLink(selectedProject)}
                  </a>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 sm:p-5 rounded-xl border border-amber-200 flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Student hasn't submitted their project link yet.
                  </p>
                </div>
              )}
              {/* Demo Video Link - */}
              {getDemoVideoLink(selectedProject) && (
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 sm:p-5 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-sm mb-2 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    Demo Video Link
                  </h3>
                  <a
                    href={getDemoVideoLink(selectedProject)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline break-all flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={14} />
                    Watch Demo Video
                  </a>
                </div>
              )}

              {/* Demo Video File Upload */}
              {getDemoVideoFile(selectedProject) && (
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 sm:p-5 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-sm mb-2 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                     Demo Video File
                  </h3>
                  <a
                    href={getFullFileUrl(getDemoVideoFile(selectedProject))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline break-all flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={14} />
                    Download/Play Video
                  </a>
                  <p className="text-xs text-slate-500 mt-2">
                    Click the link above to view the uploaded demo video
                  </p>
                </div>
              )}

              {/* Thesis Report  */}
              {getReportFile(selectedProject) && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 sm:p-5 rounded-xl border border-indigo-200">
                  <h3 className="font-bold text-sm mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                    <FileText size={16} /> Thesis Report
                  </h3>
                  <a
                    href={getFullFileUrl(getReportFile(selectedProject))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline break-all flex items-center gap-2 text-sm"
                  >
                    <ExternalLink size={14} />
                    Download Report (PDF/DOCX)
                  </a>
                  <p className="text-xs text-slate-500 mt-2">
                    Click to download the student's thesis report
                  </p>
                </div>
              )}

              {/* Evaluation Section - Marks Based */}
              {selectedProject.status !== "evaluated" ? (
                <div className="border-t pt-5 sm:pt-6">
                  <h3 className="font-bold text-base sm:text-lg mb-4 dark:text-white flex items-center gap-2">
                    <PercentCircle size={20} className="text-brand-teal" />
                    Submit Evaluation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        Obtained Marks
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={gradingData.marks}
                        onChange={(e) => {
                          const marks = parseFloat(e.target.value);
                          setGradingData((prev) => ({
                            ...prev,
                            marks: e.target.value,
                          }));
                        }}
                        placeholder="e.g., 85"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:bg-brand-dark outline-none focus:ring-2 ring-brand-teal dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={gradingData.totalMarks}
                        onChange={(e) => {
                          const totalMarks = parseFloat(e.target.value);
                          setGradingData((prev) => ({
                            ...prev,
                            totalMarks: e.target.value,
                          }));
                        }}
                        placeholder="e.g., 100"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:bg-brand-dark outline-none focus:ring-2 ring-brand-teal dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Grade Preview */}
                  {gradingData.marks && gradingData.totalMarks && (
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-brand-dark/50 rounded-xl">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-xs text-slate-500">Percentage</p>
                          <p
                            className={`text-xl font-bold ${getMarksColor(parseFloat(gradingData.marks), parseFloat(gradingData.totalMarks))}`}
                          >
                            {(
                              (parseFloat(gradingData.marks) /
                                parseFloat(gradingData.totalMarks)) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            Calculated Grade
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {calculateGrade(
                              parseFloat(gradingData.marks),
                              parseFloat(gradingData.totalMarks),
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Remarks</p>
                          <p className="text-sm font-semibold">
                            {getGradeLabel(
                              calculateGrade(
                                parseFloat(gradingData.marks),
                                parseFloat(gradingData.totalMarks),
                              ),
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium">
                          Score: {gradingData.marks} / {gradingData.totalMarks}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">
                      Feedback Comments
                    </label>
                    <textarea
                      rows="4"
                      value={gradingData.feedback}
                      onChange={(e) =>
                        setGradingData((prev) => ({
                          ...prev,
                          feedback: e.target.value,
                        }))
                      }
                      placeholder="Provide detailed feedback about the project..."
                      className="w-full p-3 sm:p-4 rounded-xl border border-slate-200 bg-white dark:bg-brand-dark outline-none focus:ring-2 ring-brand-teal dark:text-white resize-none text-sm"
                    />
                  </div>

                  <button
                    onClick={handleSubmitGrade}
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-4 bg-brand-teal text-white rounded-xl font-bold hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit Evaluation
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 p-5 sm:p-6 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle size={24} className="text-green-600" />
                    <h3 className="font-bold text-base sm:text-lg text-green-700 dark:text-green-400">
                      Evaluation Complete
                    </h3>
                  </div>

                  {/* Show Marks instead of Percentage */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-brand-dark rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Obtained Marks</p>
                      <p className="text-2xl font-bold text-green-700">
                        {selectedProject.obtainedMarks ||
                          selectedProject.marks ||
                          "-"}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-brand-dark rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Total Marks</p>
                      <p className="text-2xl font-bold text-green-700">
                        {selectedProject.totalMarks || 100}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <p className="text-xs text-slate-500">Grade</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {selectedProject.grade}
                    </p>
                  </div>

                  {selectedProject.teacherFeedback && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-1">Feedback:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-brand-dark p-3 rounded-lg">
                        {selectedProject.teacherFeedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedGroupsList;
