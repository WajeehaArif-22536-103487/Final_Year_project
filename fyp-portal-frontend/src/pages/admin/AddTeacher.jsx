import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import Layout from '../../layouts/DashboardLayout';
import API from '../../services/api';
import { toast } from 'react-toastify';

const AddTeacher = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/admin/create-teacher', formData);
      toast.success("Teacher account created!");
      setFormData({ name: '', email: '', password: '' }); // Now clears correctly
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating teacher");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black dark:text-white mb-6 flex items-center gap-2">
          <UserPlus className="text-brand-teal" /> Register New Faculty
        </h2>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-muted p-8 rounded-[2rem] shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required value={formData.name}
                className="w-full bg-slate-50 dark:bg-brand-dark pl-12 pr-4 py-4 rounded-2xl outline-none dark:text-white"
                placeholder="Dr. John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="email" value={formData.email}
                className="w-full bg-slate-50 dark:bg-brand-dark pl-12 pr-4 py-4 rounded-2xl outline-none dark:text-white"
                placeholder="teacher@university.edu"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="password" value={formData.password}
                className="w-full bg-slate-50 dark:bg-brand-dark pl-12 pr-4 py-4 rounded-2xl outline-none dark:text-white"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-brand-teal text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-teal-600 transition-all">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddTeacher;