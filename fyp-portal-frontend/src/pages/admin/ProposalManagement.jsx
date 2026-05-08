import React, { useEffect, useState } from 'react';
import { Search, BookOpen, User, GraduationCap, Eye, Calendar, FileText, X, Download } from 'lucide-react';
import Layout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 6;

const ProposalManagement = () => {
  const [proposals, setProposals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewerUrl, setViewerUrl] = useState("");

  useEffect(() => { 
    fetchProposals(); 
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/proposals');
      setProposals(data || []);
    } catch (err) { 
      console.error("Error fetching proposals", err);
      toast.error("Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewFile = (fileName) => {
    const url = getViewerUrl(fileName);
    setViewerUrl(url);
    setSelectedFile(fileName);
    setShowViewer(true);
  };

  const handleDownload = (fileName) => {
    const url = getViewerUrl(fileName);
    window.open(url, '_blank');
  };

  // Search Filter
  const filteredProposals = proposals.filter((p) => {
    const title = p?.title || "";
    const studentName = p?.student?.name || "";
    const supervisorName = p?.supervisor?.name || "";
    
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      supervisorName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
  const displayedProposals = filteredProposals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 dark:text-white">
                <BookOpen className="text-brand-teal w-6 h-6 sm:w-7 sm:h-7" />
                Project Proposals
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
                Review and manage student project proposals
              </p>
            </div>

            {/* Search Box - Responsive */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border dark:bg-brand-muted dark:border-teal-900/30 outline-none focus:ring-2 ring-brand-teal"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal"></div>
            </div>
          ) : (
            <>
              {/* Proposals Grid - Responsive */}
              {displayedProposals.length === 0 ? (
                <div className="text-center py-16 sm:py-20 opacity-50">
                  <BookOpen size={48} className="mx-auto mb-3" />
                  <p className="font-bold uppercase tracking-widest text-sm sm:text-base">
                    {search ? "No matching proposals found" : "No proposals available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  {displayedProposals.map((proposal, index) => (
                    <motion.div
                      key={proposal._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-brand-muted border dark:border-teal-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      {/* Status Badge */}
                      <div className="mb-2 sm:mb-3">
                        <StatusBadge status={proposal.status} />
                      </div>

                      {/* Title */}
                      <h2 className="text-lg sm:text-xl font-black line-clamp-2 dark:text-white mb-2 sm:mb-3">
                        {proposal.title || "Untitled Proposal"}
                      </h2>

                      {/* Description Preview */}
                      {proposal.description && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 sm:mb-4">
                          {proposal.description.length > 100 
                            ? `${proposal.description.substring(0, 100)}...` 
                            : proposal.description}
                        </p>
                      )}

                      {/* Student and Supervisor Info - Responsive grid */}
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <User size={14} className="flex-shrink-0" />
                          <span className="font-semibold">Student:</span>
                          <span className="truncate">{proposal.student?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <GraduationCap size={14} className="flex-shrink-0" />
                          <span className="font-semibold">Supervisor:</span>
                          <span className="truncate">{proposal.supervisor?.name || "Not Assigned"}</span>
                        </div>
                        {proposal.createdAt && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={14} className="flex-shrink-0" />
                            <span className="font-semibold">Submitted:</span>
                            <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Attached File Section - Responsive */}
                      {proposal.fileName && (
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-teal-900/30">
                          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={14} className="text-brand-teal flex-shrink-0" />
                              <span className="text-xs text-slate-500 truncate">
                                Proposal Document
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewFile(proposal.fileName)}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-brand-teal/10 text-brand-teal rounded-lg text-xs font-semibold hover:bg-brand-teal hover:text-white transition-all"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                onClick={() => handleDownload(proposal.fileName)}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-brand-dark text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all"
                              >
                                <Download size={12} />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination - Responsive */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1 sm:gap-2 pt-6 sm:pt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-xl font-bold transition bg-slate-100 dark:bg-brand-muted hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-xl font-bold transition
                            ${currentPage === pageNum
                              ? "bg-brand-teal text-white"
                              : "bg-slate-100 dark:bg-brand-muted hover:bg-teal-50"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-xl font-bold transition bg-slate-100 dark:bg-brand-muted hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>

      {/* Document Viewer Modal - Responsive */}
      {showViewer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-brand-muted rounded-xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b dark:border-teal-900/30">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold dark:text-white text-sm sm:text-base truncate">Document Viewer</h3>
                <p className="text-xs text-slate-400 truncate">
                  Proposal Document
                </p>
              </div>
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-brand-teal text-white rounded-lg text-xs sm:text-sm hover:bg-teal-600 transition-all"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowViewer(false);
                    setSelectedFile(null);
                    setViewerUrl("");
                  }}
                  className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3 sm:p-4 bg-gray-100 dark:bg-gray-900">
              {isPdfFile(selectedFile) ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full min-h-[400px] sm:min-h-[500px] rounded-lg"
                  title="PDF Viewer"
                />
              ) : isImageFile(selectedFile) ? (
                <img
                  src={viewerUrl}
                  alt="Document"
                  className="max-w-full mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <FileText size={48} className="text-slate-400 mb-3" />
                  <p className="text-slate-500 mb-2 text-sm">Cannot preview this file type</p>
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 text-sm"
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

export default ProposalManagement;