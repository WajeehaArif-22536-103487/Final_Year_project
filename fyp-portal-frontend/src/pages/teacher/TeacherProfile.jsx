import React from "react";
import Layout from "../../layouts/DashboardLayout";
import ProfileLayout from "../../layouts/ProfileLayouts";
import { Users, BookOpen, Award } from "lucide-react";

const TeacherProfile = () => {
  

  const customSections = [
    {
      title: "Teaching Information",
      icon: <Users size={20} className="text-brand-teal" />,
      content: (profile, isEditing, editData, setEditData) => (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Students Supervised
            </label>
            <p className="text-2xl font-black text-brand-teal">
              {profile?.totalAssignedStudents || 0}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Projects
            </label>
            <p className="text-2xl font-black text-brand-teal">
              {profile?.activeProjects || 0}
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Recent Activity",
      icon: <Award size={20} className="text-brand-teal" />,
      content: (profile, isEditing, editData, setEditData) => (
        <div className="space-y-3">
          {profile?.recentActivities?.length > 0 ? (
            profile.recentActivities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-brand-dark rounded-xl">
                <div>
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-xs text-slate-400">{activity.description}</p>
                </div>
                <span className={`text-xs ${
                  activity.status === "Approved" ? "text-green-600" : 
                  activity.status === "Rejected" ? "text-red-600" : 
                  "text-purple-600"
                }`}>
                  {activity.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No recent activities</p>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <ProfileLayout 
        userRole="teacher" 
        customSections={customSections}
      />
    </Layout>
  );
};

export default TeacherProfile;