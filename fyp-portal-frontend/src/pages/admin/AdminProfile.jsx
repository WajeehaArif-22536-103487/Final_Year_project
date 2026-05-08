import React, { useState, useEffect } from "react";
import Layout from "../../layouts/DashboardLayout";
import ProfileLayout from "../../layouts/ProfileLayouts";
import { TrendingUp, Users } from "lucide-react";
import API from "../../services/api";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [statistics, setStatistics] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/dashboard");
      setStatistics({
        totalTeachers: response.data.totalTeachers || 0,
        totalStudents: response.data.totalStudents || 0,
        activeProjects: response.data.approvedProjects || 0
      });
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const customSections = [
    {
      title: "System Statistics",
      icon: <TrendingUp size={20} className="text-brand-teal" />,
      content: (profile, isEditing, editData, setEditData) => (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-brand-dark rounded-xl">
            <Users size={24} className="text-brand-teal mx-auto mb-2" />
            <p className="text-2xl font-black">
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-slate-200 dark:bg-teal-900/30 rounded mx-auto"></div>
              ) : (
                statistics.totalTeachers
              )}
            </p>
            <p className="text-xs text-slate-400">Total Teachers</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-brand-dark rounded-xl">
            <Users size={24} className="text-brand-teal mx-auto mb-2" />
            <p className="text-2xl font-black">
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-slate-200 dark:bg-teal-900/30 rounded mx-auto"></div>
              ) : (
                statistics.totalStudents
              )}
            </p>
            <p className="text-xs text-slate-400">Total Students</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-brand-dark rounded-xl">
            <TrendingUp size={24} className="text-brand-teal mx-auto mb-2" />
            <p className="text-2xl font-black">
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-slate-200 dark:bg-teal-900/30 rounded mx-auto"></div>
              ) : (
                statistics.activeProjects
              )}
            </p>
            <p className="text-xs text-slate-400">Active Projects</p>
          </div>
        </div>
      )
    },
  ];

  return (
    <Layout>
      <ProfileLayout 
        userRole="admin" 
        customSections={customSections}
      />
    </Layout>
  );
};

export default AdminProfile;