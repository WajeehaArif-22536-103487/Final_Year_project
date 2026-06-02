import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Search, ExternalLink, BookOpen, User, Calendar, ArrowLeft, ChevronLeft, ChevronRight, Video, FileText, Github } from "lucide-react";
import API from "../services/api";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 6;

const PublicProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchPublicProjects = async () => {
    try {
      const res = await API.get("/public/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load public projects", err);
      toast.error("Failed to load public projects");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}  
              className="p-2 rounded-xl bg-white dark:bg-brand-muted shadow-md hover:bg-slate-100 dark:hover:bg-teal-900/20 transition-all group"
              title="Go Back"
            >
              <ArrowLeft size={24} className="text-brand-teal group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                <BookOpen className="text-brand-teal" />
                Public Project Repository
              </h1>
              <p className="text-slate-400 font-medium mt-1">
                Approved Final Year Projects Archive
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 rounded-xl outline-none focus:ring-2 ring-brand-teal transition-all dark:text-white"
            />
          </div>
        </div>

        {!loading && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Found <span className="font-semibold text-brand-teal">{filteredProjects.length}</span> projects
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-brand-teal font-bold animate-pulse">
            Loading public projects...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {displayedProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white dark:bg-brand-muted p-6 rounded-3xl shadow-xl border dark:border-teal-900/20 space-y-4 hover:shadow-2xl transition-all"
                >
                  <h2 className="text-xl font-black dark:text-white leading-tight line-clamp-2">
                    {project.title}
                  </h2>
                  
                  <p className="text-slate-500 text-sm line-clamp-3">
                    {project.description}
                  </p>

                  <div className="text-sm space-y-2 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>Student: {project.studentName || project.student?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Year: {project.year || new Date().getFullYear()}</span>
                    </div>
                  </div>

                  {project.grade && (
                    <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      Grade: {project.grade}
                    </div>
                  )}

                  {/* Links Section */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* GitHub Link */}
                    {(project.githubLink || project.sourceLink) && (
                      <a
                        href={project.githubLink || project.sourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-brand-teal font-bold hover:underline text-sm"
                      >
                        <Github size={14} />
                        Repository
                      </a>
                    )}

                    {/* Demo Video Link */}
                    {project.demoVideoLink && (
                      <a
                        href={project.demoVideoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 font-bold hover:underline text-sm"
                      >
                        <Video size={14} />
                        Demo Video
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {displayedProjects.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-40">
                  <BookOpen size={64} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest">
                    No public projects found
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-teal-900/20 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-brand-teal text-white"
                              : "bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 hover:bg-slate-50 dark:hover:bg-teal-900/20"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === currentPage - 2 && currentPage > 3) ||
                      (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-brand-muted border border-slate-200 dark:border-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-teal-900/20 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProject;