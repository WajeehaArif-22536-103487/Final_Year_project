import React, { useState } from "react";
import { motion } from "framer-motion";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";
import { FileText, Eye, X, CheckCircle, XCircle, MessageSquare, User, Download } from "lucide-react";

const ProposalReviewTab = ({ proposals = [], loadProposals }) => {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const getViewerUrl = (fileName) => {
    if (!fileName) return null;
    return `http://localhost:5000/uploads/proposals/${fileName}`;
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const isPdfFile = (fileName) => {
    return getFileExtension(fileName) === 'pdf';
  };

  const isImageFile = (fileName) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExts.includes(getFileExtension(fileName));
  };

  const handleStatusUpdate = async (id, action) => {
    setReviewLoading(true);
    try {
      const response = await fetch(`${API_URL}/proposals/review/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
          feedback: feedback,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(data.message || `Proposal ${action}d successfully`);
      setSelectedProposal(null);
      setFeedback("");
      if (loadProposals) loadProposals();
    } catch (err) {
      toast.error(err.message || "Failed to update proposal");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownload = (fileName) => {
    if (!fileName) return;
    const url = getViewerUrl(fileName);
    window.open(url, '_blank');
  };

  if (reviewLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[calc(100vh-200px)]">
        {/* LEFT: Proposal List */}
        <div className="w-full lg:w-2/5 bg-white dark:bg-brand-muted rounded-2xl shadow-xl flex flex-col border dark:border-teal-900/30 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="p-4 md:p-5 border-b dark:border-teal-900/50 bg-gradient-to-r from-brand-teal/5 to-transparent sticky top-0 bg-white dark:bg-brand-muted z-10">
            <span className="text-xs font-black text-brand-teal uppercase tracking-widest">
              Student Proposals ({proposals.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {proposals.length === 0 ? (
              <div className="p-10 text-center text-slate-400 italic text-sm">
                No proposals found
              </div>
            ) : (
              proposals.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    setSelectedProposal(p);
                    setFeedback("");
                  }}
                  className={`w-full text-left p-3 md:p-4 mb-2 rounded-xl transition-all ${
                    selectedProposal?._id === p._id
                      ? "bg-gradient-to-r from-brand-teal/10 to-transparent border-l-4 border-brand-teal shadow-md"
                      : "hover:bg-slate-50 dark:hover:bg-brand-dark/40 border border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base line-clamp-2 flex-1">
                      {p.title || "Untitled Proposal"}
                    </h4>
                    <StatusBadge status={p.status || "pending"} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {p.description?.substring(0, 80)}...
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between mt-2 gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {p.student?.name || "Unknown Student"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {p.fileName && (
                    <div className="mt-2 flex items-center gap-1">
                      <FileText size={10} className="text-brand-teal" />
                      <span className="text-[9px] text-brand-teal">
                        Proposal Document
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Proposal Review Panel */}
        <div className="flex-1 bg-white dark:bg-brand-muted rounded-2xl shadow-xl border dark:border-teal-900/30 overflow-y-auto max-h-[calc(100vh-200px)]">
          {!selectedProposal ? (
            <div className="h-full flex flex-col items-center justify-center p-10 min-h-[400px]">
              <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-400" />
              </div>
              <p className="font-bold uppercase tracking-widest text-center text-sm sm:text-base text-slate-500">
                Select a proposal to review
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 text-center">
                Click on any proposal from the left panel
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-6">
              {/* Title Section */}
              <div className="border-b pb-4">
                <h2 className="text-xl md:text-2xl font-black dark:text-white break-words">
                  {selectedProposal.title || "Untitled Proposal"}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <StatusBadge status={selectedProposal.status || "pending"} />
                  <span className="text-xs text-slate-400">
                    Submitted: {new Date(selectedProposal.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-slate-50 dark:bg-brand-dark/50 rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-bold text-brand-teal uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Project Description
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedProposal.description || "No description provided."}
                </p>
              </div>

              {/* Attached File Section - Simplified */}
              {selectedProposal.fileName && (
                <div className="bg-slate-50 dark:bg-brand-dark/50 rounded-xl p-4 md:p-5">
                  <h3 className="text-sm font-bold text-brand-teal uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Attached Document
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-brand-muted rounded-lg border border-slate-200 dark:border-teal-900/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-brand-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-brand-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium dark:text-white text-sm">
                          Proposal Document
                        </p>
                        <p className="text-xs text-slate-400">
                          {isPdfFile(selectedProposal.fileName) ? 'PDF Document' : 
                           selectedProposal.fileName?.toLowerCase().includes('doc') ? 'Word Document' : 'Document'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowViewer(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(selectedProposal.fileName)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-brand-dark text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Information Section */}
              <div className="bg-slate-50 dark:bg-brand-dark/50 rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-bold text-brand-teal uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User size={16} />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Full Name</p>
                    <p className="font-semibold dark:text-white break-words">{selectedProposal.student?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="font-semibold dark:text-white break-words">{selectedProposal.student?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Registration Number</p>
                    <p className="font-semibold dark:text-white font-mono text-sm break-words">
                      {selectedProposal.student?.registrationNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Supervisor</p>
                    <p className="font-semibold dark:text-white break-words">
                      {selectedProposal.supervisor?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {selectedProposal.status === "pending" && (
                <div className="space-y-4 pt-4 border-t dark:border-teal-900/30">
                  <h3 className="text-sm font-bold text-brand-teal uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={16} />
                    Review Comments
                  </h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback to the student..."
                    className="w-full p-3 md:p-4 bg-slate-50 dark:bg-brand-dark rounded-xl outline-none focus:ring-2 ring-brand-teal text-sm dark:text-white resize-none"
                    rows="4"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedProposal._id, "approve")}
                      disabled={reviewLoading}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 py-3 rounded-xl text-white font-bold uppercase hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve Proposal
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedProposal._id, "reject")}
                      disabled={reviewLoading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 py-3 rounded-xl text-white font-bold uppercase hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject Proposal
                    </button>
                  </div>
                </div>
              )}

              {/* Status Display for Non-Pending */}
              {selectedProposal.status !== "pending" && (
                <div className="bg-slate-100 dark:bg-brand-dark/50 p-4 md:p-5 rounded-xl text-center">
                  <p className="text-sm font-bold">
                    This proposal has been <span className="uppercase">{selectedProposal.status}</span>
                  </p>
                  {selectedProposal.teacherFeedback && (
                    <div className="mt-3 p-3 bg-white dark:bg-brand-muted rounded-lg text-left">
                      <p className="text-xs text-slate-400 mb-1">Feedback:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                        {selectedProposal.teacherFeedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showViewer && selectedProposal?.fileName && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-muted rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b dark:border-teal-900/30">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold dark:text-white truncate">Document Viewer</h3>
                <p className="text-xs text-slate-400 truncate">
                  Proposal Document
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedProposal.fileName)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal text-white rounded-lg text-sm hover:bg-teal-600 transition-all"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => setShowViewer(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
              {isPdfFile(selectedProposal.fileName) ? (
                <iframe
                  src={getViewerUrl(selectedProposal.fileName)}
                  className="w-full h-full min-h-[500px] rounded-lg"
                  title="PDF Viewer"
                />
              ) : isImageFile(selectedProposal.fileName) ? (
                <img
                  src={getViewerUrl(selectedProposal.fileName)}
                  alt="Document"
                  className="max-w-full mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText size={64} className="text-slate-400 mb-4" />
                  <p className="text-slate-500 mb-2">Cannot preview this file type</p>
                  <button
                    onClick={() => handleDownload(selectedProposal.fileName)}
                    className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalReviewTab;