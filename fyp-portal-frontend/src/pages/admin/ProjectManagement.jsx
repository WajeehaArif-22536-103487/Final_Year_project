import React, { useEffect, useState } from "react";
import Layout from "../../layouts/DashboardLayout";
import API from "../../services/api";
import { toast } from "react-toastify";
import { Eye, Search, BookOpen, User, Calendar, ExternalLink, Award } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 6;

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/projects");
      console.log("Fetched projects:", res.data); // Debug log
      
      let projectsData = res.data?.projects || res.data || [];
      
      // Make sure each project has a title
      projectsData = projectsData.map(project => ({
        ...project,
        displayTitle: project.title || project.proposal?.title || "Untitled Project"
      }));
      
      setProjects(projectsData);
    } catch (error) {
      toast.error("Failed to fetch projects");
      console.error(error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Search Filter
  const filteredProjects = projects.filter((p) => {
    const title = p.displayTitle || p?.title || p?.proposal?.title || "";
    const studentName = p?.student?.name || "";
    
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const displayedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Helper functions
  const getProjectTitle = (project) => {
    // Try multiple sources for the title
    if (project.displayTitle) return project.displayTitle;
    if (project.title) return project.title;
    if (project.proposal?.title) return project.proposal.title;
    if (project.proposalTitle) return project.proposalTitle;
    return "Untitled Project";
  };

  const getStudentName = (project) => {
    return project?.student?.name || "N/A";
  };

  const getSupervisorName = (project) => {
    return project?.supervisor?.name || "Not Assigned";
  };

  const getRepositoryLink = (project) => {
    return project?.repositoryLink || project?.sourceLink || null;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 dark:text-white">
              <BookOpen className="text-brand-teal w-6 h-6 sm:w-7 sm:h-7" />
              Project Repository
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
              Evaluated Final Year Projects Archive
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search projects..."
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
            {/* Project Grid */}
            {displayedProjects.length === 0 ? (
              <div className="text-center py-16 sm:py-20 opacity-50">
                <BookOpen size={48} className="mx-auto mb-3" />
                <p className="font-bold uppercase tracking-widest text-sm sm:text-base">
                  {search ? "No matching projects found" : "No projects available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {displayedProjects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-brand-muted border dark:border-teal-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <h2 className="text-base sm:text-lg lg:text-xl font-black line-clamp-2 dark:text-white mb-2 sm:mb-3">
                      {getProjectTitle(project)}
                    </h2>

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User size={14} className="flex-shrink-0" />
                        <span className="font-semibold">Student:</span>
                        <span className="truncate">{getStudentName(project)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span className="font-semibold">Supervisor:</span>
                        <span className="truncate">{getSupervisorName(project)}</span>
                      </div>
                    </div>

                    {/* Grade Badge */}
                    {project.grade && (
                      <div className="mt-3 inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-xs font-bold text-purple-700">
                        <Award size={12} />
                        Grade: {project.grade}
                      </div>
                    )}

                    {/* Repository Link */}
                    {getRepositoryLink(project) && (
                      <a
                        href={getRepositoryLink(project)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 sm:gap-2 text-brand-teal font-bold hover:underline mt-3 sm:mt-4 text-xs sm:text-sm"
                      >
                        <ExternalLink size={14} />
                        View Repository
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
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
  );
};

export default ProjectManagement;