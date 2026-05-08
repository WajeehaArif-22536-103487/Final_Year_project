
import React from "react";

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    teal: "text-teal-600 bg-teal-50",
    orange: "text-orange-600 bg-orange-50",
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div className="bg-white dark:bg-brand-muted p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-teal-900/20">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black dark:text-white mt-1">{value || 0}</h3>
    </div>
  );
};

export default StatCard;