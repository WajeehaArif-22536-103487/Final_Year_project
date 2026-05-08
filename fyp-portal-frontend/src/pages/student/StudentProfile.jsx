import React from "react";
import Layout from "../../layouts/DashboardLayout";
import ProfileLayout from "../../layouts/ProfileLayouts";
import { GraduationCap, BookOpen } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

const StudentProfile = () => {
  const additionalFields = [
    {
      name: "registrationNo",
      label: "Registration Number",
      type: "text",
      editable: false,
      hint: "Registration number cannot be changed. Contact admin if incorrect."
    }
  ];

  const customSections = [
    {
      title: "Academic Information",
      icon: <GraduationCap size={20} className="text-brand-teal" />,
      content: (profile, isEditing, editData, setEditData) => (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.department || ""}
                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                placeholder="e.g., Computer Science"
              />
            ) : (
              <p className="text-lg font-semibold dark:text-white">
                {profile?.department || "Not set"}
              </p>
            )}
          </div>

          {/* Program */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Program
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.program || ""}
                onChange={(e) => setEditData({ ...editData, program: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                placeholder="e.g., BS Computer Science"
              />
            ) : (
              <p className="text-lg font-semibold dark:text-white">
                {profile?.program || "Not set"}
              </p>
            )}
          </div>

          {/* Session */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Session
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.session || ""}
                onChange={(e) => setEditData({ ...editData, session: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                placeholder="e.g., 2021-2025"
              />
            ) : (
              <p className="text-lg font-semibold dark:text-white">
                {profile?.session || "Not set"}
              </p>
            )}
          </div>

          {/* Semester */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Semester
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.semester || ""}
                onChange={(e) => setEditData({ ...editData, semester: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                placeholder="e.g., 8th (Final Year)"
              />
            ) : (
              <p className="text-lg font-semibold dark:text-white">
                {profile?.semester || "Not set"}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "FYP Information",
      icon: <BookOpen size={20} className="text-brand-teal" />,
      content: (profile, isEditing, editData, setEditData) => {
        if (profile?.hasProposal) {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-brand-dark rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-slate-400">Project Title</p>
                    <p className="font-semibold text-brand-teal">{profile.proposalTitle}</p>
                  </div>
                  <StatusBadge status={profile.proposalStatus} />
                </div>
              </div>
              
              {profile.supervisor && (
                <div className="p-4 bg-slate-50 dark:bg-brand-dark rounded-xl">
                  <p className="text-xs text-slate-400">Supervisor</p>
                  <p className="font-semibold dark:text-white">{profile.supervisor.name}</p>
                </div>
              )}
              
              {profile.projectGrade && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-green-600">Final Grade</p>
                  <p className="text-2xl font-bold text-green-600">{profile.projectGrade}</p>
                </div>
              )}

              {profile.projectStatus === "evaluated" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-blue-600">Project Status</p>
                  <p className="font-semibold text-blue-600 capitalize">{profile.projectStatus}</p>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <div className="text-center py-8">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No project assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">Submit your proposal to get started</p>
          </div>
        );
      }
    }
  ];

  return (
    <Layout>
      <ProfileLayout 
        userRole="student" 
        additionalFields={additionalFields}
        customSections={customSections}
      />
    </Layout>
  );
};

export default StudentProfile;