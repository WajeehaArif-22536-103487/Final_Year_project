import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, FileText, CheckCircle, AlertCircle, RefreshCw, Edit, Trash2, AlertTriangle, UserPlus } from "lucide-react";
import { toast } from "react-toastify";

const DeadlinesTab = ({ token }) => {
  const [proposalDeadline, setProposalDeadline] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [rejectedDeadline, setRejectedDeadline] = useState("");
  const [currentDeadlines, setCurrentDeadlines] = useState({
    proposalDeadline: null,
    projectDeadline: null,
    rejectedDeadline: null,
    studentCount: 0,
    assignedStudentCount: 0,
    rejectedCount: 0
  });
  const [settingProposal, setSettingProposal] = useState(false);
  const [settingProject, setSettingProject] = useState(false);
  const [settingRejected, setSettingRejected] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/deadlines/my-deadlines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to fetch deadlines");
      
      const data = await response.json();
      console.log("Fetched deadlines data:", data);
      
      setCurrentDeadlines({
        proposalDeadline: data.proposalDeadline || null,
        projectDeadline: data.projectDeadline || null,
        rejectedDeadline: data.rejectedDeadline || null,
        studentCount: data.studentCount || 0,
        assignedStudentCount: data.assignedStudentCount || 0,
        rejectedCount: data.rejectedCount || 0
      });
      
      if (data.proposalDeadline) {
        setProposalDeadline(new Date(data.proposalDeadline).toISOString().slice(0, 16));
      }
      if (data.projectDeadline) {
        setProjectDeadline(new Date(data.projectDeadline).toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error("Failed to fetch deadlines:", err);
      toast.error(err.message || "Failed to load deadlines");
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  const handleSetProposalDeadline = async () => {
    if (!proposalDeadline) {
      toast.error("Please select a date and time");
      return;
    }
    
    setSettingProposal(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/proposal-deadline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deadline: proposalDeadline }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success(data.message);
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to set proposal deadline");
    } finally {
      setSettingProposal(false);
    }
  };

  const handleRemoveProposalDeadline = async () => {
    if (!confirm("Remove proposal deadline? Students will no longer have proposal submission restrictions.")) return;
    
    setSettingProposal(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/proposal-deadline`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success("Proposal deadline removed");
      setProposalDeadline("");
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to remove proposal deadline");
    } finally {
      setSettingProposal(false);
    }
  };

  const handleSetProjectDeadline = async () => {
    if (!projectDeadline) {
      toast.error("Please select a date and time");
      return;
    }
    
    setSettingProject(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/project-deadline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deadline: projectDeadline }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success(data.message);
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to set project deadline");
    } finally {
      setSettingProject(false);
    }
  };

  const handleRemoveProjectDeadline = async () => {
    if (!confirm("Remove project deadline? Students will no longer have project submission restrictions.")) return;
    
    setSettingProject(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/project-deadline`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success("Project deadline removed");
      setProjectDeadline("");
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to remove project deadline");
    } finally {
      setSettingProject(false);
    }
  };

  const handleSetRejectedStudentsDeadline = async () => {
    if (!rejectedDeadline) {
      toast.error("Please select a date and time");
      return;
    }
    
    if (currentDeadlines.rejectedCount === 0) {
      toast.error("No rejected students found");
      return;
    }
    
    setSettingRejected(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/rejected-students-deadline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newDeadline: rejectedDeadline }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success(data.message);
      setRejectedDeadline("");
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to set deadline for rejected students");
    } finally {
      setSettingRejected(false);
    }
  };

  const handleRemoveRejectedDeadline = async () => {
    if (!confirm("Remove rejected students deadline? Students will no longer have resubmission restrictions.")) return;
    
    setSettingRejected(true);
    try {
      const response = await fetch(`${API_URL}/deadlines/rejected-deadline`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success("Rejected students deadline removed");
      fetchDeadlines();
    } catch (err) {
      toast.error(err.message || "Failed to remove deadline");
    } finally {
      setSettingRejected(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black dark:text-white">Manage Deadlines</h2>
          <p className="text-slate-400 mt-1">Set submission deadlines for your students</p>
        </div>
        <button
          onClick={fetchDeadlines}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-brand-dark text-slate-600 dark:text-white hover:bg-slate-200 transition-all"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <Users size={24} className="text-blue-600" />
            <h3 className="font-bold text-blue-700 dark:text-blue-400">Students in CSV</h3>
          </div>
          <p className="text-3xl font-black text-blue-800 dark:text-blue-300">{currentDeadlines.studentCount}</p>
          <p className="text-xs text-blue-500 mt-1">Can submit proposals</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <FileText size={24} className="text-purple-600" />
            <h3 className="font-bold text-purple-700 dark:text-purple-400">Assigned Students</h3>
          </div>
          <p className="text-3xl font-black text-purple-800 dark:text-purple-300">{currentDeadlines.assignedStudentCount}</p>
          <p className="text-xs text-purple-500 mt-1">Under your supervision</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={24} className="text-orange-600" />
            <h3 className="font-bold text-orange-700 dark:text-orange-400">Rejected Proposals</h3>
          </div>
          <p className="text-3xl font-black text-orange-800 dark:text-orange-300">{currentDeadlines.rejectedCount}</p>
          <p className="text-xs text-orange-500 mt-1">Need to resubmit</p>
        </div>
      </div>

      {/* Current Deadlines Display - With Delete Buttons for All */}
      {(currentDeadlines.proposalDeadline || currentDeadlines.projectDeadline || currentDeadlines.rejectedDeadline) && (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Current Deadlines
          </h3>
          
          {/* Proposal Deadline with Delete Button */}
          {currentDeadlines.proposalDeadline && (
            <div className="mb-3 p-3 bg-white dark:bg-brand-muted rounded-xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold">Proposal Submission Deadline</p>
                  <p className="text-sm">
                    {formatDate(currentDeadlines.proposalDeadline)}
                    {new Date(currentDeadlines.proposalDeadline) > new Date() && (
                      <span className="ml-2 text-green-600 text-xs">
                        ({getDaysRemaining(currentDeadlines.proposalDeadline)} days left)
                      </span>
                    )}
                    {new Date(currentDeadlines.proposalDeadline) < new Date() && (
                      <span className="ml-2 text-red-600 text-xs">(Passed)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleRemoveProposalDeadline}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove deadline"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Project Deadline with Delete Button */}
          {currentDeadlines.projectDeadline && (
            <div className="mb-3 p-3 bg-white dark:bg-brand-muted rounded-xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold">Project Submission Deadline</p>
                  <p className="text-sm">
                    {formatDate(currentDeadlines.projectDeadline)}
                    {new Date(currentDeadlines.projectDeadline) > new Date() && (
                      <span className="ml-2 text-green-600 text-xs">
                        ({getDaysRemaining(currentDeadlines.projectDeadline)} days left)
                      </span>
                    )}
                    {new Date(currentDeadlines.projectDeadline) < new Date() && (
                      <span className="ml-2 text-red-600 text-xs">(Passed)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleRemoveProjectDeadline}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove deadline"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Rejected Students Deadline with Delete Button */}
          {currentDeadlines.rejectedDeadline && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Rejected Students Resubmission Deadline
                  </p>
                  <p className="text-sm">
                    {formatDate(currentDeadlines.rejectedDeadline)}
                    {new Date(currentDeadlines.rejectedDeadline) > new Date() && (
                      <span className="ml-2 text-green-600 text-xs">
                        ({getDaysRemaining(currentDeadlines.rejectedDeadline)} days left)
                      </span>
                    )}
                    {new Date(currentDeadlines.rejectedDeadline) < new Date() && (
                      <span className="ml-2 text-red-600 text-xs">(Passed)</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleRemoveRejectedDeadline}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove deadline"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-orange-500 mt-2">
                {currentDeadlines.rejectedCount} student(s) can resubmit before this deadline
              </p>
            </div>
          )}
        </div>
      )}

      {/* Set Proposal Deadline */}
      <div className="bg-white dark:bg-brand-muted p-8 rounded-3xl shadow-xl border dark:border-teal-900/30">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="text-brand-teal" size={28} />
          <div>
            <h3 className="text-xl font-bold dark:text-white">
              {currentDeadlines.proposalDeadline ? "Update" : "Set"} Proposal Submission Deadline
            </h3>
            <p className="text-slate-400 text-sm">For all students who can submit proposals</p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <input
            type="datetime-local"
            value={proposalDeadline}
            onChange={(e) => setProposalDeadline(e.target.value)}
            className="flex-1 p-3 rounded-xl border dark:bg-brand-dark dark:border-teal-900/30 focus:ring-2 ring-brand-teal outline-none"
          />
          <button
            onClick={handleSetProposalDeadline}
            disabled={settingProposal}
            className="px-6 py-3 bg-brand-teal text-white rounded-xl font-bold hover:bg-teal-600 transition-all disabled:opacity-50"
          >
            {settingProposal ? "Setting..." : currentDeadlines.proposalDeadline ? "Update" : "Set"}
          </button>
        </div>
      </div>

      {/* Set Project Deadline */}
      <div className="bg-white dark:bg-brand-muted p-8 rounded-3xl shadow-xl border dark:border-teal-900/30">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-brand-teal" size={28} />
          <div>
            <h3 className="text-xl font-bold dark:text-white">
              {currentDeadlines.projectDeadline ? "Update" : "Set"} Project Submission Deadline
            </h3>
            <p className="text-slate-400 text-sm">For all students assigned to you</p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <input
            type="datetime-local"
            value={projectDeadline}
            onChange={(e) => setProjectDeadline(e.target.value)}
            className="flex-1 p-3 rounded-xl border dark:bg-brand-dark dark:border-teal-900/30 focus:ring-2 ring-brand-teal outline-none"
          />
          <button
            onClick={handleSetProjectDeadline}
            disabled={settingProject}
            className="px-6 py-3 bg-brand-teal text-white rounded-xl font-bold hover:bg-teal-600 transition-all disabled:opacity-50"
          >
            {settingProject ? "Setting..." : currentDeadlines.projectDeadline ? "Update" : "Set"}
          </button>
        </div>
      </div>

      {/* Set Deadline for Rejected Students */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-8 rounded-3xl shadow-xl border-2 border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-orange-500" size={28} />
          <div>
            <h3 className="text-xl font-bold dark:text-white">
              {currentDeadlines.rejectedDeadline ? "Update" : "Set"} Deadline for Rejected Students
            </h3>
            <p className="text-slate-400 text-sm">
              {currentDeadlines.rejectedCount} student(s) have rejected proposals. 
              {currentDeadlines.rejectedDeadline ? " Update the deadline for them to resubmit." : " Set a new deadline for them to resubmit."}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <input
            type="datetime-local"
            value={rejectedDeadline}
            onChange={(e) => setRejectedDeadline(e.target.value)}
            className="flex-1 p-3 rounded-xl border dark:bg-brand-dark dark:border-teal-900/30 focus:ring-2 ring-orange-500 outline-none"
          />
          <button
            onClick={handleSetRejectedStudentsDeadline}
            disabled={settingRejected || !rejectedDeadline || currentDeadlines.rejectedCount === 0}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus size={16} />
            {settingRejected ? "Setting..." : currentDeadlines.rejectedDeadline ? "Update Deadline" : "Set Deadline"}
          </button>
        </div>
        
        {currentDeadlines.rejectedDeadline && (
          <p className="text-xs text-orange-500 mt-3 flex items-center gap-1">
            Current deadline: {formatDate(currentDeadlines.rejectedDeadline)}
          </p>
        )}
        
        <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
          <AlertTriangle size={12} />
          This deadline applies only to students with rejected proposals.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="font-bold text-blue-700 dark:text-blue-400">How Deadlines Work</p>
            <ul className="text-sm text-blue-600 dark:text-blue-300 mt-2 space-y-1">
              <li>• <strong>Proposal Deadline:</strong> Students cannot submit new proposals after this date</li>
              <li>• <strong>Project Deadline:</strong> Students cannot submit final projects after this date</li>
              <li>• <strong>Rejected Students Deadline:</strong> Special deadline for students who need to resubmit</li>
              <li>• New students automatically inherit current deadlines</li>
              <li>• Click the trash icon to remove any deadline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlinesTab;