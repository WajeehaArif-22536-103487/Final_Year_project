import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, User, Bell, LayoutGrid, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [profilePicture, setProfilePicture] = useState(null);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Set profile picture from user object
  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log("Profile update event received:", event.detail);
      if (event.detail && event.detail.profilePicture) {
        setProfilePicture(event.detail.profilePicture);
      }
    };

    window.addEventListener('profilePictureUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
  }, []);

  // Get full image URL - FIX THIS FUNCTION
const getFullImageUrl = (url) => {
  if (!url) return null;
  console.log("Original URL:", url); // Debug log
  
  // If it's already a full URL
  if (url.startsWith('http')) return url;
  
  // If it starts with /uploads, add base URL
  if (url.startsWith('/uploads')) {
    const fullUrl = `http://localhost:5000${url}`;
    console.log("Full URL:", fullUrl); // Debug log
    return fullUrl;
  }
  
  // Default
  const defaultUrl = `http://localhost:5000/uploads/${url}`;
  console.log("Default URL:", defaultUrl);
  return defaultUrl;
};

  // Get user initials for fallback
  const getUserInitials = () => {
    if (user && user.name) {
      return user.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  // Navigate to profile page
  const goToProfile = () => {
    if (user?.role === 'student') {
      navigate('/student/profile');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/profile');
    } else if (user?.role === 'admin') {
      navigate('/admin/profile');
    } else {
      navigate('/profile');
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-brand-muted/80 backdrop-blur-md border-b border-slate-100 dark:border-teal-900/20 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-30 transition-all duration-300">
      
      {/* LEFT: Branding & Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-teal-900/20 rounded-xl transition-all"
        >
          <Menu size={22} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 bg-brand-teal rounded-2xl items-center justify-center text-white shadow-lg shadow-teal-500/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <LayoutGrid size={22} />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter text-brand-dark dark:text-white leading-none uppercase">
              FYP <span className="text-brand-teal">Portal</span>
            </h1>
          </div>
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* DARK MODE SWITCH */}
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-brand-dark text-slate-500 dark:text-brand-teal hover:shadow-inner transition-all group"
        >
          {isDark ? 
            <Sun size={20} className="group-hover:rotate-45 transition-transform" /> : 
            <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
          }
        </button>

        {user && (
          <div className="flex items-center gap-3 md:gap-5 border-l border-slate-100 dark:border-teal-900/20 pl-3 md:pl-5">
            {/* USER PROFILE INFO */}
            <div className="hidden md:flex flex-col text-right">
              <p className="text-xs font-black text-brand-dark dark:text-white uppercase tracking-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-brand-teal font-black uppercase tracking-widest opacity-80">
                {user.role}
              </p>
            </div>

            {/* PROFILE PICTURE / AVATAR - Clickable */}
            <div 
              className="relative group cursor-pointer" 
              onClick={goToProfile}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-teal to-emerald-400 p-[2px] rounded-2xl shadow-md hover:shadow-lg transition-all">
                {profilePicture ? (
                  <img 
                    src={getFullImageUrl(profilePicture)} 
                    alt={user.name}
                    className="w-full h-full object-cover rounded-[14px]"
                    onError={(e) => {
                      console.error("Image failed to load:", getFullImageUrl(profilePicture));
                      setProfilePicture(null);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-white dark:bg-brand-dark rounded-[14px] flex items-center justify-center text-brand-teal font-bold text-sm">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Edit Profile
              </div>
            </div>

            {/* LOGOUT */}
            <button 
              onClick={logout} 
              className="p-2.5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;