import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth Pages
import Login from "../pages/auth/Login";
import ClaimAccount from "../pages/auth/ClaimAccount";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddTeacher from "../pages/admin/AddTeacher";
import ProposalManagement from "../pages/admin/ProposalManagement";
import UserManagement from "../pages/admin/UserManagement";
import AssignSupervisor from "../pages/admin/AssignSupervisor";
import ProjectManagement from "../pages/admin/ProjectManagement";
import AdminProfile from "../pages/admin/AdminProfile";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherProfile from "../pages/teacher/TeacherProfile";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";

// Context & Protected Route
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

import PublicProject from "../pages/PublicProjects";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications for feedback */}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/claim-account" element={<ClaimAccount />} />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-teacher"
            element={
              <ProtectedRoute role="admin">
                <AddTeacher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assign-supervisor"
            element={
              <ProtectedRoute role="admin">
                <AssignSupervisor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/proposals"
            element={
              <ProtectedRoute role="admin">
                <ProposalManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute role="admin">
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute role="admin">
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          {/* Teacher */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profile"
            element={
              <ProtectedRoute role="teacher">
                <TeacherProfile />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/public/projects" element={<PublicProject />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
