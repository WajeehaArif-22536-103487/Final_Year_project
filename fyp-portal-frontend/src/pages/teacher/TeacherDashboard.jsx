import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import OverviewTab from "./OverviewTab";
import ProposalReviewTab from "./ProposalReviewTab";
import AssignedGroupsList from "./ProjectEvaluatonTab"
import EnrollmentTab from "./EnrollmentTab";
import DeadlinesTab from "./DeadlinesTab";

import Layout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignedProposals, setAssignedProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load uploaded students from localStorage on mount
  const [uploadedStudents, setUploadedStudents] = useState(() => {
    const saved = localStorage.getItem("uploadedStudents");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever uploadedStudents changes
  useEffect(() => {
    localStorage.setItem("uploadedStudents", JSON.stringify(uploadedStudents));
  }, [uploadedStudents]);

  const fetchJSON = async (url) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid server response format");
    }
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const loadProposals = async () => {
    try {
      const data = await fetchJSON(`${API_URL}/proposals/all`);
      setProposals(data || []);
    } catch (err) {
      console.error("Load proposals error:", err);
      setProposals([]);
    }
  };

  const loadProjects = async () => {
    try {
      // Use the correct URL from teacherRoutes
      const data = await fetchJSON(`${API_URL}/teacher/projects`);
      setProjects(data || []);
    } catch (err) {
      console.error("Load projects error:", err);
      setProjects([]);
    }
  };

  const loadAssignedProposals = async () => {
    try {
      const data = await fetchJSON(`${API_URL}/teacher/assigned-proposals`);
      setAssignedProposals(data || []);
    } catch (err) {
      console.log("No assigned proposals yet");
      setAssignedProposals([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        if (!mounted) return;

        await Promise.all([
          loadProposals(),
          loadProjects(),
          loadAssignedProposals(),
        ]);
      } catch (err) {
        toast.error(err.message || "Failed to load data");
        console.error("Load all error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="overview"
          element={
            <OverviewTab
              proposals={proposals}
              projects={projects}
              assignedProposals={assignedProposals}
              loading={loading}
            />
          }
        />
        <Route
          path="review"
          element={
            <ProposalReviewTab
              proposals={proposals}
              loadProposals={loadProposals}
            />
          }
        />
        <Route
          path="evaluate"
          element={
            <AssignedGroupsList
              projects={projects}
              loadProjects={loadProjects}
              token={token}
            />
          }
        />
        <Route
          path="enrollment"
          element={
            <EnrollmentTab
              uploadedStudents={uploadedStudents}
              setUploadedStudents={setUploadedStudents}
            />
          }
        />
        <Route path="deadlines" element={<DeadlinesTab token={token} />} />
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="dashboard" element={<Navigate to="overview" replace />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </Layout>
  );
};

export default TeacherDashboard;
