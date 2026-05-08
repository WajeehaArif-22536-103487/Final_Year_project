import React from 'react';

const StatusBadge = ({ status }) => {
  // 1. Safety check: Handle cases where status might be null or undefined
  if (!status) return null;

  const colors = {
    // Progress Statuses
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    rejected: "bg-rose-100 text-rose-700 border border-rose-200",
    
    // User Account Statuses
    active: "bg-green-50 text-green-600 border border-green-200",
    suspended: "bg-red-50 text-red-600 border border-red-200",
    
    // User Roles (Added these for UserManagement registry)
    teacher: "bg-purple-100 text-purple-700 border border-purple-200",
    student: "bg-blue-100 text-blue-700 border border-blue-200",
    admin: "bg-slate-800 text-white",
  };

  const normalizedStatus = status.toLowerCase();

  return (
    <span 
      className={`
        px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter 
        transition-all duration-300 inline-block
        ${colors[normalizedStatus] || "bg-gray-100 text-gray-600"}
      `}
    >
      {status}
    </span>
  );
};

export default StatusBadge;