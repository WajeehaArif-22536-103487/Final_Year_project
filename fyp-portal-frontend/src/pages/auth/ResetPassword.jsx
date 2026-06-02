import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle, GraduationCap } from "lucide-react";
import API from "../../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { token, newPassword: password });
      setResetSuccess(true);
      toast.success("Password reset successful!");
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-teal-800 to-emerald-900">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lock size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {resetSuccess ? "Password Reset!" : "Create New Password"}
              </h1>
              <p className="text-white/50 text-sm mt-1">
                {resetSuccess 
                  ? "Your password has been changed successfully" 
                  : "Enter your new password below"}
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                      Resetting...
                    </span>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <p className="text-white/70 text-sm">
                  You can now log in with your new password.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-semibold transition-all"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;