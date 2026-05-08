import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex transition-colors duration-500 overflow-hidden">
      {/* 1. Mobile Overlay (Closes sidebar when clicking outside on mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* 2. Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} 
          md:relative md:translate-x-0 ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}`}
      >
        <Sidebar isOpen={isSidebarOpen} />
      </aside>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>

          <footer className="mt-12 py-6 text-center text-xs text-slate-400 dark:text-teal-900/50 font-medium tracking-widest uppercase">
            © 2026 University FYP Portal • Powered by React 19
          </footer>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;