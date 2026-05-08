import React from "react";
import StatusBadge from "../../components/StatusBadge";
import { BookOpen } from "lucide-react";

const OverviewTab = ({ proposals = [], projects = [], assignedProposals = [], loading = false }) => {
  
  console.log("OverviewTab received:", {
    proposalsCount: proposals.length,
    projectsCount: projects.length,
    assignedProposalsCount: assignedProposals.length,
    assignedProposals: assignedProposals
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  const totalProposals = proposals.length;
  const totalAssignedStudents = assignedProposals.length;
  const pendingReviews = proposals.filter((p) => p.status === "pending").length;
  const projectsToGrade = projects.filter(
    (p) => p.status === "submitted" || p.status === "pending"
  ).length;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-black dark:text-white">Teacher Overview</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 shadow-lg">
          <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Total Proposals
          </h3>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-2">
            {totalProposals}
          </p>
          <p className="text-xs text-blue-500 mt-1">All submitted proposals</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 shadow-lg">
          <h3 className="font-bold text-sm text-green-600 dark:text-green-400 uppercase tracking-wider">
            Assigned Students
          </h3>
          <p className="text-3xl font-black text-green-700 dark:text-green-300 mt-2">
            {totalAssignedStudents}
          </p>
          <p className="text-xs text-green-500 mt-1">Students under your supervision</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 shadow-lg">
          <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Pending Reviews
          </h3>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-300 mt-2">
            {pendingReviews}
          </p>
          <p className="text-xs text-amber-500 mt-1">Proposals waiting for review</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 shadow-lg">
          <h3 className="font-bold text-sm text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Projects to Grade
          </h3>
          <p className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-2">
            {projectsToGrade}
          </p>
          <p className="text-xs text-purple-500 mt-1">Submitted projects pending evaluation</p>
        </div>
      </div>

      {/* Assigned Students List */}
      {assignedProposals.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-teal rounded-full"></span>
            Your Assigned Students ({assignedProposals.length})
          </h3>
          <div className="grid gap-4">
            {assignedProposals.map((proposal) => (
              <div
                key={proposal._id}
                className="bg-white dark:bg-brand-muted p-5 rounded-2xl shadow-md border-l-4 border-brand-teal hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-brand-teal/20 rounded-full flex items-center justify-center">
                        <span className="text-brand-teal font-bold text-lg">
                          {proposal.student?.name?.charAt(0) || "S"}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold dark:text-white text-lg">
                          {proposal.student?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {proposal.student?.registrationNo || "No Reg No"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-brand-teal mt-2">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {proposal.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <StatusBadge status={proposal.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assigned Students Message */}
      {assignedProposals.length === 0 && (
        <div className="mt-8 p-10 text-center bg-slate-50 dark:bg-brand-muted rounded-2xl">
          <p className="text-slate-400 font-medium">No assigned students yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Once admin assigns students to you, they will appear here
          </p>
        </div>
      )}


      {/* Empty State */}
      {assignedProposals.length === 0 && proposals.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-100 dark:bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
          </div>
          <p className="text-slate-400 font-bold">No proposals or assigned students yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Once admin assigns students, they will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;