import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, UploadCloud, BookOpen,
  ShieldCheck, UserPlus, BarChart3, UserCheck, LogOut, Calendar, User
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth(); 

  const menuConfig = {
    admin: [
      { name: "Dashboard", path: "/admin", icon: <BarChart3 size={20} /> },
      { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
      { name: "Register Faculty", path: "/admin/add-teacher", icon: <UserPlus size={20} /> },
      { name: "Assign Supervisor", path: "/admin/assign-supervisor", icon: <UserCheck size={20} /> },
      { name: "Proposals", path: "/admin/proposals", icon: <FileText size={20} /> },
      { name: "Project Repository", path: "/admin/projects", icon: <BookOpen size={20} /> },
      { name: "Public Repository", path: "/public/projects", icon: <BookOpen size={20} /> },
    ],
    teacher: [
      { name: "Dashboard", path: "/teacher/overview", icon: <LayoutDashboard size={20} /> },
      { name: "Import Students", path: "/teacher/enrollment", icon: <UploadCloud size={20} /> },
      { name: "Set Deadlines", path: "/teacher/deadlines", icon: <Calendar size={20} /> },
      { name: "Review Proposals", path: "/teacher/review", icon: <ShieldCheck size={20} /> },
      { name: "Project Evaluation", path: "/teacher/evaluate", icon: <BookOpen size={20} /> },
      { name: "Public Repository", path: "/public/projects", icon: <BookOpen size={20} /> },
    ],
    student: [
      { name: "My Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
      { name: "Public Repository", path: "/public/projects", icon: <BookOpen size={20} /> },
    ],
  };

  // Get user's role-specific menu
  const currentMenu = menuConfig[user?.role] || [];

  // Get profile path based on role
  const getProfilePath = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/profile";
      case "teacher":
        return "/teacher/profile";
      case "student":
        return "/student/profile";
      default:
        return "/profile";
    }
  };

  return (
    <div className="h-full bg-brand-dark dark:bg-brand-muted flex flex-col border-r border-slate-200 dark:border-teal-900/20 transition-all duration-300">
      
      {/* Brand Logo */}
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-teal rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-teal-500/40">
          <span className="font-black text-xl">P</span>
        </div>
        {isOpen && (
          <span className="font-black text-white tracking-tighter text-xl uppercase animate-in fade-in duration-500">
            Portal
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {currentMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
                isActive
                  ? "bg-brand-teal text-white shadow-xl shadow-teal-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-brand-teal"
              }`
            }
          >
            <span className="flex-shrink-0 transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            {isOpen && <span className="truncate animate-in slide-in-from-left-2">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section - Profile & Logout */}
      <div className="mt-auto p-4 space-y-2 border-t border-slate-100 dark:border-teal-900/20">
        
        {/* Profile Link - Above Logout */}
        <NavLink
          to={getProfilePath()}
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
              isActive
                ? "bg-brand-teal text-white shadow-xl shadow-teal-500/20"
                : "text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-brand-teal"
            }`
          }
        >
          <User size={20} />
          {isOpen && <span>My Profile</span>}
        </NavLink>

        {/* Logout Button */}
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;