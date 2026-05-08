import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  ShieldCheck,
  FileText,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "../../layouts/DashboardLayout";
import API from "../../services/api";
import StatCard from "../../components/StatCard";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    approvedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard");
      setStats({
        totalStudents: statsRes.data.totalStudents || 0,
        totalTeachers: statsRes.data.totalTeachers || 0,
        totalProposals: statsRes.data.totalProposals || 0,
        approvedProjects: statsRes.data.approvedProjects || 0,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Students", count: stats?.totalStudents || 0 },
    { name: "Teachers", count: stats?.totalTeachers || 0 },
    { name: "Projects", count: stats?.approvedProjects || 0 },
  ];
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-brand-dark dark:text-white">
            System Control
          </h1>
          <p className="text-brand-teal font-semibold">
            Welcome back, Administrator
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Users />}
            label="STUDENTS"
            value={stats?.totalStudents || 0}
            color="teal"
          />
          <StatCard
            icon={<ShieldCheck />}
            label="TEACHERS"
            value={stats?.totalTeachers || 0}
            color="orange"
          />
          <StatCard
            icon={<FileText />}
            label="PROPOSALS"
            value={stats?.totalProposals || 0}
            color="blue"
          />
        </div>

        {/* Analytics Chart */}
        <div className="bg-white dark:bg-brand-muted p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-teal-900/30">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
            Portal Analytics
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: "12px", border: "none" }}
                />
                <Bar
                  dataKey="count"
                  fill="#4fd1c5"
                  radius={[10, 10, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
