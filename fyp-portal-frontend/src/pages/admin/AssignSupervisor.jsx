import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Layout from "../../layouts/DashboardLayout";
import { motion } from "framer-motion";
import StatusBadge from "../../components/StatusBadge";
import { toast } from "react-toastify";
import { ChevronDown, UserCheck, Users } from "lucide-react";

const AssignSupervisor = () => {
  const [proposals, setProposals] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        API.get("/admin/proposals"),
        API.get("/admin/users"),
      ]);

      const approved = (pRes.data || []).filter((p) => p.status === "approved");
      setProposals(approved);
      setTeachers(
        (tRes.data || []).filter(
          (u) => u.role === "teacher" && u.status === "active",
        ),
      );
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleAssign = async (proposalId, supervisorId) => {
    if (!proposalId || !supervisorId) return;

    setLoading(true);
    try {
      await API.post("/admin/assign-supervisor", { proposalId, supervisorId });
      toast.success("Supervisor assigned successfully!");
      fetchData();
    } catch (err) {
      toast.error("Failed to assign supervisor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center">
            <UserCheck className="text-brand-teal" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black dark:text-white">
              Assign Supervisors
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Assign teachers to supervise approved student projects
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {proposals.length === 0 ? (
            <div className="bg-white dark:bg-brand-muted p-12 rounded-3xl text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">
                No approved proposals available
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Proposals will appear here once teachers approve them
              </p>
            </div>
          ) : (
            proposals.map((proposal) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-brand-muted rounded-2xl shadow-lg border border-slate-100 dark:border-teal-900/20 overflow-visible hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                    {/* Project Info - Left Side */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-teal to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                          {proposal.student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-lg dark:text-white">
                            {proposal.student?.name || "Student"}
                          </p>
                          {proposal.student?.registrationNo && (
                            <p className="text-xs text-slate-400">
                              Reg: {proposal.student.registrationNo}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-brand-teal pt-1">
                        {proposal.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <StatusBadge status={proposal.status} />
                        {proposal.supervisor && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            Assigned to: {proposal.supervisor.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right - Custom Styled Dropdown */}
                    <div className="lg:min-w-[280px]   ">
                      {proposal.supervisor ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-4 border border-green-200 dark:border-green-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                              Assigned Supervisor
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-green-700 dark:text-green-300">
                              {proposal.supervisor.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Select Supervisor
                          </label>

                          {/* Custom Dropdown Button */}
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === proposal._id
                                  ? null
                                  : proposal._id,
                              )
                            }
                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl
          bg-white dark:bg-brand-dark
          border border-slate-200 dark:border-teal-900/30
          text-slate-500 dark:text-slate-400
          text-sm
          shadow-sm
          hover:border-brand-teal dark:hover:border-teal-500
          focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20
          transition-all duration-200"
                          >
                            <span>-- Select a supervisor --</span>
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 transition-transform duration-200 ${openDropdown === proposal._id ? "rotate-180" : ""}`}
                            />
                          </button>

                          {/* Custom Dropdown Menu */}
                          {openDropdown === proposal._id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-brand-dark rounded-xl shadow-2xl border border-slate-200 dark:border-teal-900/30 overflow-visible"
                            >
                              <div className="max-h-64 overflow-y-auto">
                                {teachers.length === 0 ? (
                                  <div className="p-3 text-center text-slate-400 text-sm">
                                    No teachers available
                                  </div>
                                ) : (
                                  teachers.map((teacher) => (
                                    <button
                                      key={teacher._id}
                                      onClick={() => {
                                        handleAssign(proposal._id, teacher._id);
                                        setOpenDropdown(null);
                                      }}
                                      disabled={loading}
                                      className="w-full px-4 py-2.5 text-left hover:bg-brand-teal/10 dark:hover:bg-teal-900/30 transition-colors border-b border-slate-100 dark:border-teal-900/20 last:border-0 group"
                                    >
                                      <p className="text-sm font-medium text-slate-700 dark:text-white group-hover:text-brand-teal dark:group-hover:text-brand-teal whitespace-nowrap">
                                        {teacher.name}
                                      </p>
                                      <p className="text-xs text-slate-400 truncate">
                                        {teacher.email}
                                      </p>
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssignSupervisor;
