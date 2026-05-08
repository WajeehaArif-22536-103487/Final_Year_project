import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Github,
  ExternalLink,
  UserCheck,
  Calendar,
  GraduationCap,
  PartyPopper,
  Trophy,
  FileText,
  Upload,
  X,
  Star,
  PercentCircle,
} from "lucide-react";
import Layout from "../../layouts/DashboardLayout";
import API from "../../services/api";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const [proposal, setProposal] = useState(null);
  const [project, setProject] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [projectDeadline, setProjectDeadline] = useState(null);
  const [proposalDeadlineInfo, setProposalDeadlineInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceLink, setSourceLink] = useState("");
  const [proposalData, setProposalData] = useState({
    title: "",
    description: "",
  });
  const [proposalFile, setProposalFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rejectedDeadlineInfo, setRejectedDeadlineInfo] = useState(null);
  const [titleAvailable, setTitleAvailable] = useState(null);
  const [checkingTitle, setCheckingTitle] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      await fetchDeadline();
      await fetchData();
      await fetchProposalDeadlineInfo();
      await fetchRejectedProposalDeadlineInfo();
    };
    loadAll();
  }, []);

  // Debounced title check
  useEffect(() => {
    const checkTitle = async () => {
      if (!proposalData.title.trim() || proposalData.title.length < 3) {
        setTitleAvailable(null);
        return;
      }
      
      setCheckingTitle(true);
      try {
        const res = await API.get(`/proposals/check-title?title=${encodeURIComponent(proposalData.title)}`);
        setTitleAvailable(res.data.available);
        if (!res.data.available) {
          toast.warning(res.data.message);
        }
      } catch (err) {
        console.error("Title check error:", err);
      } finally {
        setCheckingTitle(false);
      }
    };
    
    const timeoutId = setTimeout(checkTitle, 500);
    return () => clearTimeout(timeoutId);
  }, [proposalData.title]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const proposalRes = await API.get("/proposals/my");
      const proposalData = proposalRes.data;
      console.log("Fetched proposal:", proposalData);
      setProposal(proposalData);

      if (proposalData && proposalData.status === "approved") {
        try {
          const projectRes = await API.get("/projects/my");
          console.log("Project response:", projectRes.data);
          setProject(projectRes.data);

          if (projectRes.data?._id) {
            await fetchProjectDeadline(projectRes.data._id);
          }
        } catch (err) {
          console.log("No project found yet");
        }
      } else if (proposalData && proposalData.status === "pending") {
        setProject(null);
        setProjectDeadline(null);
      }
    } catch (err) {
      console.log("No proposal found yet");
      setProposal(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeadline = async () => {
    try {
      const res = await API.get("/deadlines/teacher-project-deadline");
      console.log("Teacher project deadline response:", res.data);

      if (res.data?.deadline) {
        setProjectDeadline(res.data.deadline);
        setDeadline({ projectDeadline: res.data.deadline });
      } else {
        setProjectDeadline(null);
      }
    } catch (err) {
      console.log("No deadlines set", err);
    }
  };

  const fetchProjectDeadline = async (projectId) => {
    try {
      const res = await API.get(`/deadlines/project-deadline/${projectId}`);
      console.log("Project deadline response:", res.data);
      if (res.data && res.data.deadline) {
        setProjectDeadline(res.data.deadline);
      } else {
        const teacherDeadlineRes = await API.get(
          "/deadlines/teacher-project-deadline",
        );
        if (teacherDeadlineRes.data?.deadline) {
          setProjectDeadline(teacherDeadlineRes.data.deadline);
        } else {
          setProjectDeadline(null);
        }
      }
    } catch (err) {
      console.log("No project deadline set");
      try {
        const teacherDeadlineRes = await API.get(
          "/deadlines/teacher-project-deadline",
        );
        if (teacherDeadlineRes.data?.deadline) {
          setProjectDeadline(teacherDeadlineRes.data.deadline);
        }
      } catch (e) {
        setProjectDeadline(null);
      }
    }
  };

  const fetchProposalDeadlineInfo = async () => {
    try {
      const res = await API.get("/deadlines/check-proposal-deadline");
      console.log("Proposal deadline info:", res.data);
      setProposalDeadlineInfo(res.data);
    } catch (err) {
      console.log("No proposal deadline info");
      setProposalDeadlineInfo({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "Waiting for teacher to set resubmission deadline",
      });
    }
  };

  const fetchRejectedProposalDeadlineInfo = async () => {
    try {
      const res = await API.get("/deadlines/check-rejected-proposal-deadline");
      console.log("Rejected proposal deadline info:", res.data);
      setRejectedDeadlineInfo(res.data);
    } catch (err) {
      console.log("No rejected proposal deadline info");
      setRejectedDeadlineInfo({
        canSubmit: false,
        deadline: null,
        isPassed: false,
        message: "Waiting for teacher to set resubmission deadline",
      });
    }
  };

  const isSupervisorAssigned = () => {
    return proposal?.supervisor !== null && proposal?.supervisor !== undefined;
  };

  const isDeadlinePassed = () => {
    if (!projectDeadline) return false;
    return new Date(projectDeadline) < new Date();
  };

  const isDeadlineSet = () => {
    return projectDeadline !== null && projectDeadline !== undefined;
  };

  const isProjectEvaluated = () => {
    return project?.status === "evaluated";
  };

  const isProjectSubmitted = () => {
    return project?.sourceLink && project.status !== "evaluated";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }

      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["pdf", "doc", "docx", "txt"];
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(`Invalid file type: .${fileExtension}. Only PDF, DOC, DOCX, and TXT files are allowed`);
        e.target.value = "";
        return;
      }

      if (!allowedMimeTypes.includes(file.type)) {
        toast.error(`Invalid file format. Please upload a valid PDF, DOC, DOCX, or TXT file`);
        e.target.value = "";
        return;
      }

      setProposalFile(file);
      toast.success(`File "${file.name}" selected successfully`);
    }
  };

  const removeFile = () => {
    setProposalFile(null);
    const fileInput = document.getElementById("proposal-file-input");
    if (fileInput) fileInput.value = "";
    toast.info("File removed");
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    const isRejectedResubmission = proposal && proposal.status === "rejected";
    
    if (!isRejectedResubmission) {
      if (!proposalData.title.trim()) {
        toast.error("Please enter a project title");
        return;
      }
      
      const genericTitles = ['project', 'fyp', 'final year project', 'my project', 'untitled'];
      if (genericTitles.includes(proposalData.title.toLowerCase().trim())) {
        toast.warning("Please use a more specific and descriptive project title");
        return;
      }
    }

    const deadlineInfo = isRejectedResubmission
      ? rejectedDeadlineInfo
      : proposalDeadlineInfo;

    if (isRejectedResubmission) {
      if (!rejectedDeadlineInfo?.deadline) {
        toast.warning("Teacher has not set a resubmission deadline yet. Please wait.");
        return;
      }
      if (rejectedDeadlineInfo?.isPassed) {
        toast.error("Resubmission deadline has passed! You cannot submit.");
        return;
      }
    } else {
      if (proposalDeadlineInfo?.deadline === null) {
        toast.warning("Teacher has not set a proposal deadline yet. Please wait.");
        return;
      }
      if (proposalDeadlineInfo?.isPassed) {
        toast.error("Proposal deadline has passed! You cannot submit.");
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", proposalData.title);
      formData.append("description", proposalData.description);
      if (proposalFile) {
        formData.append("proposalFile", proposalFile);
      }

      const { data } = await API.post("/proposals/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      setProposalData({ title: "", description: "" });
      setProposalFile(null);

      await fetchData();
      await fetchProposalDeadlineInfo();
      await fetchRejectedProposalDeadlineInfo();

      toast.success(
        isRejectedResubmission
          ? "Proposal resubmitted successfully! Waiting for review."
          : "Proposal submitted successfully!",
      );
    } catch (err) {
      console.error("Submission error:", err);
      
      if (err.response?.data?.duplicate) {
        toast.error(
          <div>
            <strong>Duplicate Proposal Detected!</strong><br />
            {err.response.data.message}
          </div>,
          { autoClose: 8000 }
        );
        const titleInput = document.querySelector('input[placeholder="e.g., AI Powered Health Assistant"]');
        if (titleInput) {
          titleInput.classList.add('border-red-500', 'ring-red-500');
          setTimeout(() => {
            titleInput.classList.remove('border-red-500', 'ring-red-500');
          }, 3000);
        }
      } else {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleSourceSubmit = async () => {
    if (!sourceLink) {
      toast.error("Please provide a GitHub or project link");
      return;
    }

    if (!isSupervisorAssigned()) {
      toast.warning("Waiting for admin to assign a supervisor.");
      return;
    }

    if (!isDeadlineSet()) {
      toast.warning("Teacher has not set a deadline yet. Please wait.");
      return;
    }

    if (isDeadlinePassed()) {
      toast.error(
        "Project submission deadline has passed! You cannot submit now.",
      );
      return;
    }

    try {
      const { data } = await API.put("/projects/submit-source", { sourceLink });
      setProject(data.project);
      toast.success("Final project link submitted successfully!");
      setSourceLink("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit link");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Global Deadline Banner */}
     {/* Global Deadline Banner - Only show if not evaluated, not submitted, and deadline exists */}
{!isProjectEvaluated() && !isProjectSubmitted() &&
  deadline &&
  (deadline.proposalDeadline || deadline.projectDeadline) && (
    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200">
      <div className="flex items-center gap-3">
        <Calendar size={20} className="text-amber-600" />
        <div className="text-sm text-amber-700 dark:text-amber-400">
          {deadline.proposalDeadline && (
            <p>
              Proposal Deadline:{" "}
              {new Date(deadline.proposalDeadline).toLocaleString()}
            </p>
          )}
          {deadline.projectDeadline && (
            <p>
              Project Deadline:{" "}
              {new Date(deadline.projectDeadline).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )}

        {/* CASE 1: NO PROPOSAL YET */}
        {!proposal && (
          <div className="bg-white dark:bg-brand-muted p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-teal-900/20">
            <div className="mb-8">
              <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">
                Submit Final Year Proposal
              </h2>
              <p className="text-slate-400 font-bold mt-1">
                Enter your project details and upload proposal document for
                supervisor review.
              </p>
            </div>

            {proposalDeadlineInfo?.deadline === null && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 border border-amber-200">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-700 dark:text-amber-400">
                      No Deadline Set
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      Your teacher has not set a proposal deadline yet. You
                      cannot submit until a deadline is set.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {proposalDeadlineInfo?.deadline &&
              !proposalDeadlineInfo.isPassed && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-700 dark:text-blue-400">
                        Proposal Deadline
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">
                        {new Date(
                          proposalDeadlineInfo.deadline,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {proposalDeadlineInfo?.isPassed && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6 border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400">
                      Deadline Passed!
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      The proposal deadline has passed. You cannot submit now.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Project Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={
                      !proposalDeadlineInfo?.deadline ||
                      proposalDeadlineInfo?.isPassed
                    }
                    placeholder="e.g., AI Powered Health Assistant"
                    className={`w-full bg-slate-50 dark:bg-brand-dark p-4 rounded-2xl outline-none focus:ring-2 ring-brand-teal dark:text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                      titleAvailable === false ? 'border-2 border-red-500' : ''
                    }`}
                    value={proposalData.title}
                    onChange={(e) =>
                      setProposalData({ ...proposalData, title: e.target.value })
                    }
                  />
                  {checkingTitle && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-teal"></div>
                    </div>
                  )}
                  {titleAvailable === false && (
                    <p className="text-red-500 text-xs mt-1">This title is already taken or very similar to an existing proposal</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Project Description
                </label>
                <textarea
                  required
                  disabled={
                    !proposalDeadlineInfo?.deadline ||
                    proposalDeadlineInfo?.isPassed
                  }
                  rows="5"
                  placeholder="Describe your project goals, tools, and expected outcomes..."
                  className="w-full bg-slate-50 dark:bg-brand-dark p-4 rounded-2xl outline-none focus:ring-2 ring-brand-teal dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  value={proposalData.description}
                  onChange={(e) =>
                    setProposalData({
                      ...proposalData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Proposal Document (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="proposal-file-input"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={
                      !proposalDeadlineInfo?.deadline ||
                      proposalDeadlineInfo?.isPassed
                    }
                    className="hidden"
                  />
                  {!proposalFile ? (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("proposal-file-input")?.click()
                      }
                      disabled={
                        !proposalDeadlineInfo?.deadline ||
                        proposalDeadlineInfo?.isPassed
                      }
                      className="w-full border-2 border-dashed border-slate-300 dark:border-teal-900/30 rounded-2xl p-6 text-center hover:border-brand-teal transition-all disabled:opacity-50"
                    >
                      <Upload
                        size={32}
                        className="mx-auto text-slate-400 mb-2"
                      />
                      <p className="text-sm text-slate-500">
                        Click to upload proposal document
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF, DOC, DOCX, TXT (Max 10MB)
                      </p>
                    </button>
                  ) : (
                    <div className="bg-slate-50 dark:bg-brand-dark rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-brand-teal" />
                        <div>
                          <p className="font-medium dark:text-white">
                            {proposalFile.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(proposalFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <X size={18} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="w-full bg-slate-200 dark:bg-brand-dark rounded-full h-2">
                  <div
                    className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-xs text-center mt-1 text-slate-500">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !proposalDeadlineInfo?.deadline ||
                  proposalDeadlineInfo?.isPassed
                }
                className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={18} /> Submit for Review
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* CASE 2: PROPOSAL PENDING */}
        {proposal && proposal.status === "pending" && (
          <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 flex items-center gap-6">
            <Clock className="text-amber-500 animate-pulse" size={48} />
            <div>
              <h2 className="text-xl font-black text-amber-800 dark:text-amber-400 uppercase">
                Proposal Pending Review
              </h2>
              <p className="text-amber-700/60 dark:text-amber-400/60 font-medium">
                Your proposal "{proposal.title}" is under review. Please wait
                for supervisor approval.
              </p>
            </div>
          </div>
        )}

        {/* CASE 3: PROPOSAL REJECTED */}
        {proposal && proposal.status === "rejected" && (
          <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border border-red-100">
            <div className="flex items-center gap-6">
              <AlertCircle className="text-red-500" size={48} />
              <div className="flex-1">
                <h2 className="text-xl font-black text-red-800 dark:text-red-400 uppercase">
                  Proposal Rejected
                </h2>
                <p className="text-red-700/60 dark:text-red-400/60 font-medium">
                  Your proposal "{proposal.title}" was not approved.
                </p>
                {proposal.teacherFeedback && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                    <strong>Feedback:</strong> {proposal.teacherFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-red-200">
              <h3 className="font-bold text-lg mb-4">Submit New Proposal</h3>

              {!rejectedDeadlineInfo?.deadline && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-4 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-700 dark:text-amber-400">
                        No Resubmission Deadline Set
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-500">
                        Your teacher has not set a new deadline for resubmission
                        yet. Please wait.
                      </p>
                      <p className="text-xs text-amber-500 mt-2">
                        Contact your teacher if you need to resubmit.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {rejectedDeadlineInfo?.deadline &&
                !rejectedDeadlineInfo.isPassed && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-green-600" />
                      <div>
                        <p className="font-bold text-green-700 dark:text-green-400">
                          Resubmission Deadline
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {new Date(
                            rejectedDeadlineInfo.deadline,
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-500 mt-2">
                          You can resubmit your proposal before this deadline.
                        </p>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <div className="text-xl font-bold text-green-600">
                        {Math.ceil(
                          (new Date(rejectedDeadlineInfo.deadline) -
                            new Date()) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </div>
                      <div className="text-xs text-green-500">
                        days left to resubmit
                      </div>
                    </div>
                  </div>
                )}

              {rejectedDeadlineInfo?.isPassed && (
                <div className="bg-red-100 p-4 rounded-xl mb-4 border border-red-300">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <div>
                      <p className="font-bold text-red-700">
                        Resubmission Deadline Passed!
                      </p>
                      <p className="text-sm text-red-600">
                        The resubmission deadline has passed. You cannot submit
                        a new proposal.
                      </p>
                      <p className="text-xs text-red-500 mt-2">
                        Contact your teacher for an extension.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    New Project Title
                  </label>
                  <input
                    type="text"
                    required
                    disabled={
                      !rejectedDeadlineInfo?.deadline ||
                      rejectedDeadlineInfo?.isPassed
                    }
                    placeholder="New Project Title"
                    className="w-full p-3 rounded-xl border bg-white dark:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    value={proposalData.title}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    New Project Description
                  </label>
                  <textarea
                    required
                    disabled={
                      !rejectedDeadlineInfo?.deadline ||
                      rejectedDeadlineInfo?.isPassed
                    }
                    rows="3"
                    placeholder="New Project Description"
                    className="w-full p-3 rounded-xl border bg-white dark:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    value={proposalData.description}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* File Upload for Resubmission */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Proposal Document (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resubmit-file-input"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={
                        !rejectedDeadlineInfo?.deadline ||
                        rejectedDeadlineInfo?.isPassed
                      }
                      className="hidden"
                    />
                    {!proposalFile ? (
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("resubmit-file-input")
                            ?.click()
                        }
                        disabled={
                          !rejectedDeadlineInfo?.deadline ||
                          rejectedDeadlineInfo?.isPassed
                        }
                        className="w-full border-2 border-dashed border-slate-300 dark:border-teal-900/30 rounded-xl p-4 text-center hover:border-brand-teal transition-all disabled:opacity-50"
                      >
                        <Upload
                          size={24}
                          className="mx-auto text-slate-400 mb-2"
                        />
                        <p className="text-sm text-slate-500">
                          Upload new proposal document
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          PDF, DOC, DOCX, TXT (Max 10MB)
                        </p>
                      </button>
                    ) : (
                      <div className="bg-slate-50 dark:bg-brand-dark rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-brand-teal" />
                          <div>
                            <p className="font-medium dark:text-white text-sm">
                              {proposalFile.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(proposalFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !rejectedDeadlineInfo?.deadline ||
                    rejectedDeadlineInfo?.isPassed
                  }
                  className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={18} /> Submit New Proposal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CASE 4: PROPOSAL APPROVED - Not yet submitted */}
       {proposal &&
          proposal.status === "approved" &&
          !isProjectSubmitted() &&
          !isProjectEvaluated() && (
            <div className="bg-white dark:bg-brand-muted p-10 rounded-[2.5rem] shadow-xl border border-teal-500/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                    Proposal Approved!
                  </h2>
                </div>
              </div>

              {!isSupervisorAssigned() && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <UserCheck size={20} className="text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-700 dark:text-amber-400">
                        Supervisor Not Assigned Yet
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-500">
                        Please wait for admin to assign a supervisor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isSupervisorAssigned() && !isDeadlineSet() && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-700 dark:text-amber-400">
                        Deadline Not Set Yet
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-500">
                         Your teacher will set a submission deadline. Please wait.
                      </p>
                      <p className="text-xs text-amber-500 mt-2">
                        Use this time to prepare your final project!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isSupervisorAssigned() &&
                isDeadlineSet() &&
                !isDeadlinePassed() && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-6 border border-green-200">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-green-600" />
                        <div>
                          <p className="font-bold text-green-700 dark:text-green-400">
                            Submission Deadline
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-500">
                            {projectDeadline
                              ? new Date(projectDeadline).toLocaleString()
                              : "Loading..."}
                          </p>
                        </div>
                      </div>
                      {projectDeadline &&
                        new Date(projectDeadline) > new Date() && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {Math.ceil(
                                (new Date(projectDeadline) - new Date()) /
                                  (1000 * 60 * 60 * 24),
                              )}
                            </div>
                            <div className="text-xs text-green-500">
                              days left
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

              {isSupervisorAssigned() &&
                isDeadlineSet() &&
                isDeadlinePassed() && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6 border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-red-500" />
                      <div>
                        <p className="font-bold text-red-700 dark:text-red-400">
                          Deadline Passed!
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-500">
                          The submission deadline has passed. You cannot submit
                          now. Contact your teacher.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-brand-dark rounded-2xl border-2 border-transparent focus-within:border-brand-teal transition-all">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                    GitHub / Project Link
                  </label>
                  <div className="flex items-center gap-3">
                    <Github className="text-slate-400" size={20} />
                    <input
                      type="url"
                      disabled={
                        !isSupervisorAssigned() ||
                        !isDeadlineSet() ||
                        isDeadlinePassed()
                      }
                      placeholder="https://github.com/your-username/project-repo"
                      className="bg-transparent w-full outline-none font-bold dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      value={sourceLink}
                      onChange={(e) => setSourceLink(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSourceSubmit}
                  disabled={
                    !isSupervisorAssigned() ||
                    !isDeadlineSet() ||
                    isDeadlinePassed()
                  }
                  className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} /> Submit Final Project
                </button>
              </div>
            </div>
          )}

        {/* CASE 5: PROJECT SUBMITTED - Waiting for evaluation */}
        {isProjectSubmitted() && !isProjectEvaluated() && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-200 space-y-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="text-emerald-600" size={32} />
              <div>
                <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">
                  Project Submitted Successfully!
                </h2>
                <p className="text-emerald-600/70 dark:text-emerald-400/70">
                  Your project is under evaluation.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-brand-dark p-4 rounded-xl">
              <p className="text-sm font-bold mb-2">Submitted Link:</p>
              <a
                href={project.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal hover:underline flex items-center gap-2 break-all"
              >
                <ExternalLink size={16} />
                {project.sourceLink}
              </a>
            </div>
          </div>
        )}

        {/* CASE 6: PROJECT EVALUATED - Final Result */}
        {isProjectEvaluated() && project.grade && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-300 via-emerald-500 to-teal-600 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -ml-18 -mb-18 animate-pulse delay-1000"></div>

            <div className="absolute top-4 right-4 text-white animate-bounce">
              <PartyPopper size={28} />
            </div>
            <div className="absolute bottom-4 left-4 text-white animate-bounce delay-500">
              <Trophy size={24} />
            </div>

            <div className="relative z-10 p-5 md:p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2 backdrop-blur-sm">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                  Congratulations!
                </h2>
                <p className="text-white/70 text-xs mt-0.5">
                  You have successfully completed your Final Year Project
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white/60 text-[9px] uppercase tracking-wider flex items-center justify-center gap-1">
                    <Star size={12} /> Obtained Marks
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {project.obtainedMarks || project.marks || "-"}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white/60 text-[9px] uppercase tracking-wider flex items-center justify-center gap-1">
                    <FileText size={12} /> Total Marks
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {project.totalMarks || 100}
                  </p>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">
                    Project Title
                  </p>
                  <p className="text-white text-base md:text-lg font-bold truncate">
                    {proposal?.title || project.title}
                  </p>
                </div>

                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30 shadow-md">
                    <div className="text-center">
                      <p className="text-white/60 text-[8px] font-black uppercase tracking-wider">
                        Grade
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-white">
                        {project.grade}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {project.teacherFeedback && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/20">
                  <div className="flex-1">
                    <p className="text-white/60 text-[9px] uppercase tracking-wider mb-0.5">
                      Teacher's Feedback
                    </p>
                    <p className="text-white text-sm italic leading-relaxed">
                      "{project.teacherFeedback}"
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-white/60 text-[9px] uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-white font-semibold text-xs">
                    {project?.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : "2024"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-white/60 text-[9px] uppercase tracking-wider">
                    Status
                  </p>
                  <p className="text-white font-semibold text-xs capitalize">
                    {project?.status}
                  </p>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-white/20">
                <p className="text-white/60 text-[10px]">
                  This project has been successfully evaluated and archived.
                </p>
                <button
                  onClick={() => (window.location.href = "/public/projects")}
                  className="mt-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
                >
                  View in Public Repository
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;